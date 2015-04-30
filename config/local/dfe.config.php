<?php
/**
 * local/dfe.config.php-dist
 * Set various settings for use with DreamFactory Enterprise
 *
 * Copy this file to "/config/dfe.config.php" and make necessary changes.
 *
 * Format of the array should be as follows:
 *
 *  return array(
 *      'MY_VARIABLE1' => 'my value1',
 *      'MY_VARIABLE2' => 'my value2',
 *      'MY_VARIABLE3' => 'my value3',
 *      'MY_VARIABLE4' => 'my value4',
 *  );
 *
 * @return array
 */
return array(
    'dfe' => array(
        'default-domain' => '.enterprise.dreamfactory.com',
        'redirect-url'   => 'http://google.com',
        'endpoint'       => array(
            'server' => 'console.enterprise.dreamfactory.com',
            'port'   => 80,
            'prefix' => '/api/v1',
        )
    )
);