<?php
use DreamFactory\Oasys\Enums\EndpointTypes;
use DreamFactory\Oasys\Enums\ProviderConfigTypes;
use DreamFactory\Oasys\Enums\TokenTypes;

/**
 * linked_in.template.php
 *
 * This is the template for connecting to LinkedIn.
 */
return array(
    'id'                  => 'linked_in',
    'type'                => ProviderConfigTypes::OAUTH,
    'access_token_type'   => TokenTypes::BEARER,
    'client_id'           => '756n5s0t5m7h2p',
    'client_secret'       => '19MAsWSZXH2bsYps',
    'access_token'        => 'e26e94f2-705c-4fba-ad54-29d01c4c3859',
    'access_token_secret' => 'e2867b9b-e860-4799-a4fb-07df1e643dc7',
    'scope'               => LinkedIn::DEFAULT_SCOPE,
    'redirect_proxy_url'  => 'https://oasys.cloud.dreamfactory.com/oauth/authorize',
    'endpoint_map'        => array(
        EndpointTypes::AUTHORIZE    => 'https://www.linkedin.com/uas/oauth2/authorization',
        EndpointTypes::ACCESS_TOKEN => 'https://www.linkedin.com/uas/oauth2/accessToken',
        EndpointTypes::SERVICE      => 'https://api.linkedin.com/v1',
        EndpointTypes::IDENTITY     => '/people/~',
    ),
    'referrer_domain'     => 'facebook.com',
);
