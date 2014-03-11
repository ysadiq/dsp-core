<?php
/**
 * This file is part of the DreamFactory Services Platform(tm) (DSP)
 *
 * DreamFactory Services Platform(tm) <http://github.com/dreamfactorysoftware/dsp-core>
 * Copyright 2012-2013 DreamFactory Software, Inc. <developer-support@dreamfactory.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
use DreamFactory\Common\Utility\DataFormat;
use DreamFactory\Platform\Exceptions\BadRequestException;
use DreamFactory\Platform\Utility\RestResponse;
use DreamFactory\Platform\Utility\ServiceHandler;
use DreamFactory\Platform\Yii\Models\Service;
use DreamFactory\Yii\Controllers\BaseFactoryController;
use DreamFactory\Yii\Utility\Pii;
use Kisma\Core\Enums\HttpMethod;
use Symfony\Component\HttpFoundation\Request;

/**
 * RestController
 * REST API router and controller
 */
class RestController extends BaseFactoryController
{
	//*************************************************************************
	//	Members
	//*************************************************************************

	/**
	 * @var string service to direct call to
	 */
	protected $_service;
	/**
	 * @var string resource to be handled by service
	 */
	protected $_resource;
	/**
	 * @var Request The inbound request
	 */
	protected $_requestObject;

	//*************************************************************************
	//	Methods
	//*************************************************************************

	/**
	 * Initialize controller and populate request object
	 */
	public function init()
	{
		parent::init();

		$this->_requestObject = Pii::app()->getRequestObject();
	}

	/**
	 * All authorization handled by services
	 *
	 * @return array
	 */
	public function accessRules()
	{
		return array();
	}

	/**
	 * /rest/index
	 */
	public function actionIndex()
	{
		try
		{
			$_result = array( 'service' => Service::available( false, array( 'id', 'api_name' ) ) );

			$_outputFormat = RestResponse::detectResponseFormat( null, $_internal );
			$_result = DataFormat::reformatData( $_result, null, $_outputFormat );

			RestResponse::sendResults( $_result, RestResponse::Ok, $_outputFormat );
		}
		catch ( \Exception $_ex )
		{
			RestResponse::sendErrors( $_ex );
		}
	}

	/**
	 * {@InheritDoc}
	 */
	public function actionGet()
	{
		$this->_handleAction( HttpMethod::GET );
	}

	/**
	 * {@InheritDoc}
	 */
	public function actionPost()
	{
		$_action = HttpMethod::POST;

		try
		{
			//	Check for verb tunneling via X-Http-Method/X-Http-Method-Override header
			$_tunnelMethod = strtoupper(
				$this->_requestObject->headers->get(
					'x-http-method',
					$this->_requestObject->headers->get(
						'x-http-method-override',
						$this->_requestObject->get( 'method' )
					)
				)
			);

			if ( !empty( $_tunnelMethod ) )
			{
				if ( !HttpMethod::contains( $_tunnelMethod ) )
				{
					throw new BadRequestException( 'Invalid verb "' . $_tunnelMethod . '" in request.' );
				}

				$_action = $_tunnelMethod;
			}

			$this->_handleAction( $_action );
		}
		catch ( \Exception $ex )
		{
			RestResponse::sendErrors( $ex );
		}
	}

	/**
	 * {@InheritDoc}
	 */
	public function actionMerge()
	{
		$this->_handleAction( HttpMethod::MERGE );
	}

	/**
	 * {@InheritDoc}
	 */
	public function actionPut()
	{
		$this->_handleAction( HttpMethod::PUT );
	}

	/**
	 * {@InheritDoc}
	 */
	public function actionDelete()
	{
		$this->_handleAction( HttpMethod::DELETE );
	}

	/**
	 * Generic action handler
	 *
	 * @param string $action
	 */
	protected function _handleAction( $action )
	{
		try
		{
			$_service = ServiceHandler::getService( $this->_service );
			$_service->processRequest( $this->_resource, $action );
		}
		catch ( \Exception $ex )
		{
			RestResponse::sendErrors( $ex );
		}
	}

	/**
	 * Override base method to do some processing of incoming requests.
	 *
	 * Fixes the slash at the end of the parsed path. Yii removes the trailing
	 * slash by default. However, some DSP APIs require it to determine the
	 * difference between a file and a folder.
	 *
	 * Routes look like this:        rest/<service:[_0-9a-zA-Z-]+>/<resource:[_0-9a-zA-Z-\/. ]+>
	 *
	 * @param \CAction $action
	 *
	 * @return bool
	 * @throws Exception
	 */
	protected function beforeAction( $action )
	{
		$_request = Pii::app()->getRequestObject();

		$_pathInfo = $_request->getPathInfo();
		$_trailingSlash = ( '/' == $_pathInfo[strlen( $_pathInfo ) - 1] );
		$_path = trim( $_pathInfo, '/' );
		$_pathParts = explode( '/', $_path );

		if ( !empty( $_pathParts ) )
		{
			//	Shift off the controller ID
			if ( $this->id != ( $_controllerId = array_shift( $_pathParts ) ) )
			{
				Log::notice( 'Requested path controller ID "' . $_controllerId . '" does not match mine: ' . $this->id );
			}

			$this->_service = array_shift( $_pathParts );
			$this->_resource = implode( '/', $_pathParts );

			//	Fix removal of trailing slashes from resource
			if ( !empty( $this->_resource ) && $_trailingSlash )
			{
				$this->_resource .= '/';
			}
		}

		return parent::beforeAction( $action );
	}

	/**
	 * @param string $resource
	 *
	 * @return RestController
	 */
	public function setResource( $resource )
	{
		$this->_resource = $resource;

		return $this;
	}

	/**
	 * @return string
	 */
	public function getResource()
	{
		return $this->_resource;
	}

	/**
	 * @param string $service
	 *
	 * @return RestController
	 */
	public function setService( $service )
	{
		$this->_service = $service;

		return $this;
	}

	/**
	 * @return string
	 */
	public function getService()
	{
		return $this->_service;
	}

	/**
	 * @return \Symfony\Component\HttpFoundation\Request
	 */
	public function getRequestObject()
	{
		return $this->_requestObject;
	}

}
