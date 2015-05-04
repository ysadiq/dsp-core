<?php
/**
 * This file is part of the DSP JetPack Custom Trigger Example
 * Copyright 2014 DreamFactory Software, Inc. {@email support@dreamfactory.com}
 *
 * DSP JetPack Custom Trigger Example {@link http://github.com/dreamfactorysoftware/jetpack-custom-trigger}
 * DreamFactory Oasys(tm) {@link http://github.com/dreamfactorysoftware/oasys}
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
namespace DreamFactory\JetPack\Examples\CustomTrigger\Resources\System;

use DreamFactory\Platform\Exceptions\ForbiddenException;
use Kisma\Core\Utility\Option;
use DreamFactory\Platform\Resources\User\Session;
use DreamFactory\Platform\Utility\ResourceStore;

/**
 * User
 * Overrides the base functionality of the system resource handler
 *
 * @author    Jerry Ablan <jerryablan@dreamfactory.com>
 */
class User extends \DreamFactory\Platform\Resources\System\User
{
	//*************************************************************************
	//	Methods
	//*************************************************************************

	/**
	 * Handler for a get
	 *
	 * @throws \DreamFactory\Platform\Exceptions\ForbiddenException
	 * @return bool
	 */
	protected function _handleGet()
	{
		$_hour = date( 'H' );

		if ( $_hour >= 0 && $_hour < 6 )
		{
			throw new ForbiddenException( 'Access to users is restricted between the hours of 00:00 and 06:00 every day.' );
		}

		return parent::_handleGet();
	}

	/**
	 * Handler for PUT requests
	 *
	 * @return bool
	 */
	protected function _handlePut()
	{
		$_response = parent::_handlePut();

		if ( $_response )
		{
			if ( is_array( $_response ) )
			{
				Log::debug( 'array received' );
			}
		}
	}

}
