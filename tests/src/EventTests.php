<?php
namespace DreamFactory\Platform;

use DreamFactory\Platform\Events\Enums\ResourceServiceEvents;
use DreamFactory\Platform\Utility\RestResponse;
use DreamFactory\Platform\Utility\ServiceHandler;
use DreamFactory\Yii\Utility\Pii;
use Kisma\Core\Utility\FilterInput;

require_once dirname( __DIR__ ) . '/bootstrap.php';
require_once dirname( dirname( __DIR__ ) ) . '/app/controllers/RestController.php';

/**
 * EventTests.php
 */
class EventTests extends \PHPUnit_Framework_TestCase
{
	protected $_preProcessFired = 0;
	protected $_postProcessFired = 0;

	//*************************************************************************
	//	Methods
	//*************************************************************************

	public function testServiceRequestEvents()
	{
		$this->_preProcessFired = $this->_postProcessFired = 0;

		$_config = require( dirname( dirname( __DIR__ ) ) . '/config/web.php' );

		/** @var \RestController $_controller */
		list( $_controller, $_actionId ) = Pii::app()->createController( 'rest/user' );

		try
		{
			$_controller->setService( 'user' );
			$_service = ServiceHandler::getService( $_controller->getService() );

			$_service->on(
				ResourceServiceEvents::PRE_PROCESS,
				function ( $event, $eventName, $dispatcher )
				{
					$this->assertEquals( 'user.get.pre_process', $eventName );
					$this->_preProcessFired = 1;
				}
			);

			$_service->on(
				ResourceServiceEvents::POST_PROCESS,
				function ( $event, $eventName, $dispatcher )
				{
					$this->assertEquals( 'user.get.post_process', $eventName );
					$this->_postProcessFired = 1;
				}
			);

			//	Test GET
			$_REQUEST['app_name'] = __CLASS__;

			$_response = $_service->processRequest( null, 'GET', false );

			$this->assertTrue( 1 == $this->_preProcessFired && 1 == $this->_postProcessFired );
		}
		catch ( \Exception $ex )
		{
			RestResponse::sendErrors( $ex );
		}
	}

	/**
	 * Override base method to do some processing of incoming requests
	 *
	 * @param \CAction $action
	 *
	 * @return bool
	 * @throws Exception
	 */
	protected function _beforeAction( $action )
	{
		/**
		 * fix the slash at the end, Yii removes trailing slash by default,
		 * but it is needed in some APIs to determine file vs folder, etc.
		 * 'rest/<service:[_0-9a-zA-Z-]+>/<resource:[_0-9a-zA-Z-\/. ]+>'
		 */
		$_path = $_service = FilterInput::get( $_GET, 'path', null, FILTER_SANITIZE_STRING );
		$_resource = null;

		if ( false !== ( $_pos = strpos( $_path, '/' ) ) )
		{
			$_service = substr( $_path, 0, $_pos );
			$_resource = $_pos < strlen( $_path ) ? substr( $_path, $_pos + 1 ) : null;

//			// fix removal of trailing slashes from resource
//			if ( !empty( $this->_resource ) )
//			{
//				$requestUri = Yii::app()->request->requestUri;
//
//				if ( ( false === strpos( $requestUri, '?' ) && '/' === substr( $requestUri, strlen( $requestUri ) - 1, 1 ) ) ||
//					 ( '/' === substr( $requestUri, strpos( $requestUri, '?' ) - 1, 1 ) )
//				)
//				{
//					$this->_resource .= '/';
//				}
//			}
		}

		return array( $_service, $_resource );
	}

}
