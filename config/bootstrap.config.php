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
use DreamFactory\Library\Enterprise\Storage\Enums\EnterprisePaths;
use DreamFactory\Library\Utility\Environment;
use Kisma\Core\Enums\PhpFrameworks;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * This configuration file returns the array used to bootstrap the app instance
 */
return call_user_func(
    function ()
    {
        $_environment = new Environment();

        //  Some basics....
        $_basePath = dirname( __DIR__ );
        $_hostname = $_environment->getHostname( true, true );
        $_appMode = $_environment->cli( 'console', 'web' );
        $_configPath = $_basePath . '/config';
        $_vendorPath = $_basePath . '/vendor';
        $_logPath = $_basePath . '/log';

        /** Initialize runtime settings */

        return
            array(
                /** General Options & Services */
                'app.class'                  => 'DreamFactory\\Platform\\Yii\\Components\\Platform' . ucwords( $_appMode ) . 'Application',
                'app.hostname'               => $_hostname,
                'app.mode'                   => $_appMode,
                'app.config'                 => null,
                'app.resolver'               => null,
                'app.request'                => Request::createFromGlobals(),
                'app.response'               => Response::create(),
                /** Paths */
                'app.mount_point'            => EnterprisePaths::MOUNT_POINT,
                'app.base_path'              => $_basePath,
                'app.config_path'            => $_configPath,
                'app.vendor_path'            => $_vendorPath,
                'app.log_path'               => $_logPath,
                'app.document_root'          => $_basePath . '/web',
                'app.app_path'               => $_basePath . '/web',
                'app.template_path'          => $_configPath . '/templates',
                /** Bootstrap Options */
                'app.auto_run'               => true,
                'app.append_autoloader'      => false,
                'app.enable_config_cache'    => true,
                'app.framework'              => PhpFrameworks::Yii,
                'app.framework.use_yii_lite' => USE_YII_LITE,
                'app.hosted_instance'        => $_environment->isHosted(),
                'app.config_file'            => $_configPath . '/' . $_appMode . '.php',
                'app.log_file'               => $_appMode . '.' . $_hostname . '.log',
                /** Debug Options */
                'app.debug'                  => defined( 'DSP_DEBUG' ) && DSP_DEBUG || false,
                'app.debug.use_php_error'    => defined( 'DSP_DEBUG_PHP_ERROR' ) && DSP_DEBUG_PHP_ERROR || false,
            );
    }
);
