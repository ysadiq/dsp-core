<?php
namespace DreamFactory\Platform;

use DreamFactory\Platform\Events\Enums\ResourceServiceEvents;
use DreamFactory\Platform\Utility\ServiceHandler;
use Kisma\Core\Utility\FilterInput;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

require_once dirname( __DIR__ ) . '/bootstrap.php';
require_once dirname( dirname( __DIR__ ) ) . '/app/controllers/RestController.php';

/**
 * EventTests.php
 */
class EventTests extends \PHPUnit_Framework_TestCase
{
	//*************************************************************************
	//	Methods
	//*************************************************************************

	public function testServiceRequestEvents()
	{
		$_config = require( dirname( dirname( __DIR__ ) ) . '/config/web.php' );

		/** @var \RestController $_controller */
		$_controller = new \RestController( 'rest' );
		$_controller->setAction( $_action = new \CInlineAction( $_controller, 'user' ) );

		try
		{
			list( $_service, $_resource ) = $this->_beforeAction( $_action );

			$_service = ServiceHandler::getService( $_controller->getService() );

			$_service->on(
				ResourceServiceEvents::PRE_PROCESS,
				function ( $event, $eventName, $dispatcher )
				{
					$this->assertEquals( 'user.get.pre_process', $eventName );
					/**
					 * @var \DreamFactory\Platform\Events\PlatformEvent $event
					 * @var string                                      $eventName
					 * @var EventDispatcherInterface                    $dispatcher
					 */
					$event->getResponse();
				}
			);
			$_service->on(
				ResourceServiceEvents::POST_PROCESS,
				function ( $event, $eventName, $dispatcher )
				{
					/**
					 * @var \DreamFactory\Platform\Events\PlatformEvent $event
					 * @var string                                      $eventName
					 * @var EventDispatcherInterface                    $dispatcher
					 */
					$event->getResponse();
				}
			);
			$svcObj->processRequest( $this->_resource, $action );
		}
		catch ( \Exception $ex )
		{
			RestResponse::sendErrors( $ex );
		}

		$_result = $_controller->actionGet();
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
