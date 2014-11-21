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
use DreamFactory\Library\Enterprise\Storage\Enums\EnterpriseDefaults;
use DreamFactory\Library\Utility\AppBuilder;
use DreamFactory\Library\Utility\Includer;

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
$_configPath = $_basePath . '/config';
$_autoloader = require( $_vendorPath . '/autoload.php' );

//  Load up Yii if it's not been already
if ( !class_exists( '\\Yii', false ) )
{
    /** @noinspection PhpIncludeInspection */
    require $_vendorPath . '/dreamfactory/yii/framework/yii' . ( USE_YII_LITE ? 'lite' : null ) . '.php';
}

//  Create the application
$_app = new AppBuilder( Includer::includeIfExists( $_configPath . DIRECTORY_SEPARATOR . EnterpriseDefaults::BOOTSTRAP_FILE, true ) );

//  Let 'er rip! This does not return until the request is complete.
$_app->run( __DIR__ );
