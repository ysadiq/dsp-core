<?php
/**
 * This file is part of the DreamFactory Services Platform(tm) (DSP)
 *
 * DreamFactory Services Platform(tm) <http://github.com/dreamfactorysoftware/dsp-core>
 * Copyright 2012-2014 DreamFactory Software, Inc. <support@dreamfactory.com>
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
use DreamFactory\Library\Enterprise\Storage\Enums\EnterprisePaths;
use DreamFactory\Library\Enterprise\Storage\Resolver;
use DreamFactory\Library\Utility\AppInstance;
use DreamFactory\Library\Utility\Environment;
use Kisma\Core\Enums\PhpFrameworks;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBag;

/** index.php -- Main entry point/bootstrap for all processes **/

//******************************************************************************
//* Constants
//******************************************************************************

/**
 * @type bool Global debug flag: If true, your logs will grow large and your performance will suffer, but fruitful information will be gathered.
 */
const DSP_DEBUG = true;
/**
 * @type bool Global PHP-ERROR flag: If true, PHP-ERROR will be utilized if available. See https://github.com/JosephLenton/PHP-Error for more info.
 */
const DSP_DEBUG_PHP_ERROR = true;
/**
 * @type bool Enable/disable use of yiilite bootstrap
 */
const USE_YII_LITE = false;

//******************************************************************************
//* Bootstrap
//******************************************************************************

//  Include the autoloader
$_basePath = dirname( __DIR__ );
$_vendorPath = $_basePath . '/vendor';
$_autoloader = require( $_vendorPath . '/autoload.php' );

//  Load up Yii if it's not been already
if ( !class_exists( '\\Yii', false ) )
{
    /** @noinspection PhpIncludeInspection */
    require $_vendorPath . '/dreamfactory/yii/framework/yii' . ( USE_YII_LITE ? 'lite' : null ) . '.php';
}

//  Create the application
$_app = new AppInstance( _getAppParameters_(), $_autoloader );
$_app->set( 'autoloader', $_autoloader );

//  Let 'er rip! This does not return until the request is complete.
$_app->run( __DIR__ );

//******************************************************************************
//* Configuration
//******************************************************************************

/**
 * @return ParameterBag The runtime configuration
 */
function _getAppParameters_()
{
    //  Some basics....
    $_appMode = 'cli' == PHP_SAPI ? 'console' : 'web';
    $_basePath = dirname( __DIR__ );
    $_configPath = $_basePath . '/config';
    $_vendorPath = $_basePath . '/vendor';
    $_logPath = $_basePath . '/log';
    $_hostname = Environment::getHostname( true, true );
    $_hostedInstance = EnterprisePaths::hostedInstance();

    //  Create a resolver
    $_resolver = new Resolver();
    $_resolver->setPartitioned( $_hostedInstance );
    $_resolver->initialize( $_hostname, EnterprisePaths::MOUNT_POINT, $_basePath );

    /** Initialize runtime settings */
    $_config =
        array(
            /** General Options & Services */
            'app.class'                  => 'DreamFactory\\Platform\\Yii\\Components\\Platform' . ucwords( $_appMode ) . 'Application',
            'app.mode'                   => $_appMode,
            'app.config'                 => null,
            'app.resolver'               => $_resolver,
            /** Paths */
            'app.base_path'              => $_basePath,
            'app.config_path'            => $_configPath,
            'app.vendor_path'            => $_vendorPath,
            'app.log_path'               => $_logPath,
            'app.document_root'          => __DIR__,
            'app.app_path'               => $_basePath . '/web',
            'app.template_path'          => $_configPath . '/templates',
            /** Bootstrap Options */
            'app.auto_run'               => true,
            'app.append_autoloader'      => false,
            'app.enable_config_cache'    => true,
            'app.framework'              => PhpFrameworks::Yii,
            'app.framework.use_yii_lite' => USE_YII_LITE,
            'app.hosted_instance'        => $_hostedInstance,
            'app.config_file'            => $_configPath . '/' . $_appMode . '.php',
            'app.log_file'               => $_appMode . '.' . $_hostname . '.log',
            /** Debug Options */
            'app.debug'                  => DSP_DEBUG,
            'app.debug.use_php_error'    => DSP_DEBUG_PHP_ERROR,
        );

    return new ParameterBag( $_config );
}
