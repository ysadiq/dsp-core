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
use DreamFactory\Library\Utility\AppInstance;
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

//******************************************************************************
//* Bootstrap
//******************************************************************************

/** Load the autoloader */
$_autoloader = require_once( __DIR__ . '/../vendor/autoload.php' );

/** Initialize the instance container */
$_bag = new ParameterBag(
    array(
        'app.class_name'          => 'DreamFactory\\Platform\\Yii\\Components\\Platform' . ( 'cli' == PHP_SAPI ? 'Console' : 'Web' ) . 'Application',
        'app.config'              => null,
        'app.document_root'       => __DIR__,
        'app.debug'               => DSP_DEBUG,
        'app.debug.use_php_error' => DSP_DEBUG_PHP_ERROR,
        'app.auto_run'            => true,
        'app.prepend_autoloader'  => true,
        'app.enable_config_cache' => true,
        'app.log_file'            => null,
    )
);

$_app = new AppInstance( $_bag );

//  Load up composer...
$_app->set( 'autoloader', $_autoloader );

//  Load up Yii if it's not been already
if ( !class_exists( '\\Yii', false ) )
{
    require_once __DIR__ . '/../vendor/dreamfactory/yii/framework/yii.php';
}

//  Create the application and run. This does not return until the request is complete.
$_app->run( __DIR__ );
