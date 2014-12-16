<?php
/**
 * This file is part of the DreamFactory Services Platform(tm) (DSP)
 *
 * DreamFactory Services Platform(tm) <http://github.com/dreamfactorysoftware/dsp-core>
 * Copyright 2012-2015 DreamFactory Software, Inc. <support@dreamfactory.com>
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
use DreamFactory\Library\Utility\Enums\FactoryEnum;
use DreamFactory\Library\Utility\Includer;
use DreamFactory\Platform\Enums\LocalStorageTypes;
use Kisma\Core\Utility\Log;

/**
 * All constants required by the DreamFactory Services Platform(tm)
 */
final class DreamFactory extends FactoryEnum
{
    //*************************************************************************
    //* General Constants
    //*************************************************************************

    /**
     * @var string
     */
    const DSP_VERSION = '1.8.2';
    /**
     * @var string
     */
    const API_VERSION = '1.0';
    /**
     * @var string
     */
    const INSTALL_TYPE_KEY = 'dsp.install_type';
    /**
     * @var string
     */
    const DEFAULT_SUPPORT_EMAIL = 'support@dreamfactory.com';
    /**
     * @var string
     */
    const DEFAULT_CLOUD_API_ENDPOINT = 'http://api.cloud.dreamfactory.com';
    /**
     * @var string
     */
    const DEFAULT_INSTANCE_AUTH_ENDPOINT = 'http://cerberus.fabric.dreamfactory.com/api/instance/credentials';

    //******************************************************************************
    //* *_CONFIG_PATH constants
    //******************************************************************************

    /**
     * @var string
     */
    const ALIASES_CONFIG_PATH = '/aliases.config.php';
    /**
     * @var string
     */
    const COMMON_CONFIG_PATH = '/common.config.php';
    /**
     * @var string
     */
    const CONSTANTS_CONFIG_PATH = '/constants.config.php';
    /**
     * @var string
     */
    const DATABASE_CONFIG_PATH = '/database.config.php';
    /**
     * @var string
     */
    const ENV_CONFIG_PATH = '/env.config.php';
    /**
     * @var string
     */
    const KEYS_CONFIG_PATH = '/keys.config.php';
    /**
     * @var string
     */
    const SALT_CONFIG_PATH = '/salt.config.php';
    /**
     * @var string
     */
    const SERVICES_CONFIG_PATH = '/services.config.php';

    //******************************************************************************
    //* Namespace Constants
    //******************************************************************************

    /**
     * @type string The namespace prefix for default platform services
     */
    const SERVICES_NAMESPACE = 'DreamFactory\\Platform\\Services\\';

    //******************************************************************************
    //* Methods
    //******************************************************************************

    /**
     * @param string   $which    The type of config file to get. Must be defined above (i.e. "salt", "keys", "env", "database", etc.)
     * @param bool     $include  If true, the file is "include"'d and results returned
     * @param bool     $require  If true, the file is "require"'d and results returned
     * @param bool     $once     If true, and ($require === true), the file is "require_once"'d and results returned
     * @param callable $callback If set, the contents of the included file are sent to this callback as the first argument. Your callable must return
     *                           an array of key-value pairs
     *
     * @return mixed If ($include === false), the full path to the requested configuration file is returned. Otherwise it is include/required as
     *               requested
     */
    public static function getConfigFile( $which, $include = false, $require = false, $once = false, $callback = null )
    {
        try
        {
            $_value = static::defines( strtoupper( trim( $which ) ) . '_CONFIG_PATH', true );
        }
        catch ( \Exception $_ex )
        {
            throw new \RuntimeException( 'The config type "' . $which . '" could not be found.' );
        }

        $_file = static::normalizePath( __DIR__, $_value );

        if ( !$include )
        {
            return $_file;
        }

        $_contents = Includer::includeIfExists( $_file, $require, $once ) ?: array();

        return is_callable( $callback ) ? call_user_func( $callback, $_contents ) : $_contents;
    }

    /**
     * Given a path and an optional appendage, they are trimmed of directory separators and appended properly. Basically avoiding '//' in paths.
     *
     * @param string $path
     * @param string $appendage Optional additional path/file added to path and normalized
     *
     * @return string
     */
    public static function normalizePath( $path, $appendage = null )
    {
        return rtrim( $path, ' ' . DIRECTORY_SEPARATOR ) . DIRECTORY_SEPARATOR . ltrim( $appendage, ' ' . DIRECTORY_SEPARATOR );
    }

    /**
     * Reads the env.config.php file and sets any values found inside.
     *
     * @param array $extras an array of $key => $value pairs to add
     */
    public static function setEnvironmentVariables( array $extras = array() )
    {
        if ( false !== ( $_config = static::getConfigFile( 'env', true ) ) )
        {
            if ( is_array( $_config ) )
            {
                $_config = array_merge( $_config, $extras );

                foreach ( $_config as $_key => $_value )
                {
                    //  We can only set strings, so assume it's JSON...
                    if ( !is_string( $_value ) )
                    {
                        //  Don't set things we can't
                        if ( false === ( $_value = json_encode( $_value ) ) || JSON_ERROR_NONE !== json_last_error() )
                        {
                            continue;
                        }
                    }

                    if ( false === putenv( $_key . '=' . $_value ) )
                    {
                        Log::error( 'Error setting environment variable: ' . $_key . ' = ' . $_value );
                    }
                }
            }
        }
    }

    /**
     * @param string $basePath       The base instance installation path
     * @param bool   $hostedInstance True if this a DreamFactory Enterprise(tm) instance
     *
     * @return array
     */
    public static function getStorageConfiguration( $basePath, $hostedInstance = false )
    {
        /** This instance's storage keys, if hosted */
        $_storageKey = \Kisma::get( 'platform.storage_key' );
        $_privatePath = \Kisma::get( 'platform.private_path' );

        /** Set up and return the common settings... */
        if ( $hostedInstance )
        {
            $_storageBasePath = LocalStorageTypes::FABRIC_STORAGE_BASE_PATH . DIRECTORY_SEPARATOR . $_storageKey;
            $_storagePath = $_storageBasePath . ( version_compare( DSP_VERSION, '2.0.0', '<' ) ? '/blob' : null );

            $_identity = array(
                'dsp.storage_id'         => $_storageKey,
                'dsp.private_storage_id' => \Kisma::get( 'platform.private_storage_key' ),
                'dsp_name'               => \Kisma::get( 'platform.dsp_name' ),
            );
        }
        else
        {
            $_storagePath = $_storageBasePath = $basePath . LocalStorageTypes::LOCAL_STORAGE_BASE_PATH;
            $_privatePath = $basePath . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . '.private';

            $_identity = array(
                'dsp.storage_id'         => null,
                'dsp.private_storage_id' => null,
                'dsp_name'               => \Kisma::get( 'platform.host_name' ),
            );
        }

        //	Merge the common junk with specifics
        return array_merge(
            $_identity,
            array(
                //  Base configuration directories
                LocalStorageTypes::STORAGE_BASE_PATH   => $_storageBasePath,
                LocalStorageTypes::STORAGE_PATH        => $_storagePath,
                LocalStorageTypes::PRIVATE_PATH        => $_privatePath,
                //  Public configuration directories
                LocalStorageTypes::APPLICATIONS_PATH   => $_storagePath . '/applications',
                LocalStorageTypes::LIBRARY_PATH        => $_storagePath . '/plugins',
                LocalStorageTypes::PLUGINS_PATH        => $_storagePath . '/plugins',
                LocalStorageTypes::SWAGGER_PATH        => $_storagePath . '/swagger',
                //  Private configuration directories
                LocalStorageTypes::LOCAL_CONFIG_PATH   => $_privatePath . '/config',
                LocalStorageTypes::PRIVATE_CONFIG_PATH => $_privatePath . '/config',
                LocalStorageTypes::SNAPSHOT_PATH       => $_privatePath . '/snapshots',
                //  "app" namespace directories
                'app.plugins_path'                     => $_storagePath . '/plugins',
                'app.private_path'                     => $_privatePath,
            )
        );
    }
}
