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
use DreamFactory\Platform\Enums\PlatformServiceTypes;
use DreamFactory\Platform\Enums\PlatformStorageTypes;

/**
 * services.config.php
 * This file contains the core service mappings for the DSP
 */
return array(
    PlatformServiceTypes::LOCAL_FILE_STORAGE   => array(
        'class' => \DreamFactory::SERVICES_NAMESPACE . 'LocalFileSvc',
    ),
    PlatformServiceTypes::REMOTE_FILE_STORAGE  => array(
        'class' => array(
            PlatformStorageTypes::AZURE_BLOB               => array(
                'class' => \DreamFactory::SERVICES_NAMESPACE . 'WindowsAzureBlobSvc',
            ),
            PlatformStorageTypes::AWS_S3                   => array(
                'class' => \DreamFactory::SERVICES_NAMESPACE . 'AwsS3Svc',
            ),
            PlatformStorageTypes::OPENSTACK_OBJECT_STORAGE => array(
                'class' => \DreamFactory::SERVICES_NAMESPACE . 'OpenStackObjectStoreSvc',
            ),
            PlatformStorageTypes::RACKSPACE_CLOUDFILES     => array(
                'class' => \DreamFactory::SERVICES_NAMESPACE . 'OpenStackObjectStoreSvc',
            ),
        ),
    ),
    PlatformServiceTypes::LOCAL_SQL_DB         => array(
        'class' => \DreamFactory::SERVICES_NAMESPACE . 'SqlDbSvc',
        'local' => true,
    ),
    PlatformServiceTypes::REMOTE_SQL_DB        => array(
        'class' => \DreamFactory::SERVICES_NAMESPACE . 'SqlDbSvc',
        'local' => false,
    ),
    PlatformServiceTypes::LOCAL_SQL_DB_SCHEMA  => array(
        'class' => \DreamFactory::SERVICES_NAMESPACE . 'SchemaSvc',
        'local' => true,
    ),
    PlatformServiceTypes::REMOTE_SQL_DB_SCHEMA => array(
        'class' => \DreamFactory::SERVICES_NAMESPACE . 'SchemaSvc',
        'local' => false,
    ),
    PlatformServiceTypes::EMAIL_SERVICE        => array(
        'class' => \DreamFactory::SERVICES_NAMESPACE . 'EmailSvc',
    ),
    PlatformServiceTypes::NOSQL_DB             => array(
        'class' => array(
            PlatformStorageTypes::AWS_DYNAMODB => array(
                'class' => \DreamFactory::SERVICES_NAMESPACE . 'AwsDynamoDbSvc',
            ),
            PlatformStorageTypes::AWS_SIMPLEDB => array(
                'class' => \DreamFactory::SERVICES_NAMESPACE . 'AwsSimpleDbSvc',
            ),
            PlatformStorageTypes::AZURE_TABLES => array(
                'class' => \DreamFactory::SERVICES_NAMESPACE . 'WindowsAzureTablesSvc',
            ),
            PlatformStorageTypes::COUCHDB      => array(
                'class' => \DreamFactory::SERVICES_NAMESPACE . 'CouchDbSvc',
            ),
            PlatformStorageTypes::MONGODB      => array(
                'class' => \DreamFactory::SERVICES_NAMESPACE . 'MongoDbSvc',
            ),
        ),
    ),
    PlatformServiceTypes::LOCAL_PORTAL_SERVICE => array(
        'class' => \DreamFactory::SERVICES_NAMESPACE . 'Portal',
    ),
    PlatformServiceTypes::SCRIPT_SERVICE       => array(
        'class' => \DreamFactory::SERVICES_NAMESPACE . 'Script',
    ),
    PlatformServiceTypes::REMOTE_WEB_SERVICE   => array(
        'class' => \DreamFactory::SERVICES_NAMESPACE . 'RemoteWebSvc',
    ),
    PlatformServiceTypes::SALESFORCE           => array(
        'class' => \DreamFactory::SERVICES_NAMESPACE . 'SalesforceDbSvc',
    ),
    PlatformServiceTypes::PUSH_SERVICE         => array(
        'class' => array(
            PlatformStorageTypes::AWS_SNS => array(
                'class' => \DreamFactory::SERVICES_NAMESPACE . 'AwsSnsSvc',
            ),
        ),
    ),
);
