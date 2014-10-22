<?php
namespace DreamFactory\Platform;

use DreamFactory\Platform\Utility\Fabric;

/**
 * ProviderTests.php
 */
class ProviderTests extends \PHPUnit_Framework_TestCase
{
    //******************************************************************************
    //* Constants
    //******************************************************************************

    /**
     * @type string
     */
    const API_KEY = 'some-api-key';

    //*************************************************************************
    //	Methods
    //*************************************************************************

    public function testGlobalProviderPull()
    {
        $_providers = Fabric::getProviderCredentials();

        $this->assertTrue( is_array( $_providers ) );
    }

}
