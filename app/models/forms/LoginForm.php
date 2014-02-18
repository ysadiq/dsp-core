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
use DreamFactory\Platform\Resources\User\Session;
use DreamFactory\Platform\Yii\Components\DrupalUserIdentity;
use DreamFactory\Platform\Yii\Components\PlatformUserIdentity;
use DreamFactory\Yii\Utility\Pii;

/**
 * LoginForm class.
 * LoginForm is the data structure for keeping user login form data.
 * It is used by the 'login' action of 'WebController'.
 */
class LoginForm extends CFormModel
{
	//*************************************************************************
	//	Constants
	//*************************************************************************

	/**
	 * @var string The faux-attribute to hold any authentication errors
	 */
	const ERROR_ATTRIBUTE = 'Authentication';
	/**
	 * @var string The standard authentication error message
	 */
	const ERROR_MESSAGE = 'Invalid user name and password combination.';

	//*************************************************************************
	//	Members
	//*************************************************************************

	/**
	 * @var string
	 */
	public $username;
	/**
	 * @var string
	 */
	public $password;
	/**
	 * @var boolean
	 */
	public $rememberMe = false;
	/**
	 * @var array The session data populated once logged in
	 */
	protected $_sessionData = null;
	/**
	 * @var PlatformUserIdentity
	 */
	protected $_identity;
	/**
	 * @var DrupalUserIdentity
	 */
	protected $_drupalIdentity;
	/**
	 * @var bool
	 */
	protected $_drupalAuth = true;

	//*************************************************************************
	//	Methods
	//*************************************************************************

	/**
	 * Declares the validation rules.
	 * The rules state that username and password are required,
	 * and password needs to be authenticated.
	 */
	public function rules()
	{
		return array(
			array( 'username, password', 'required' ),
			array( 'rememberMe', 'boolean' ),
			array( 'password', 'authenticate' ),
		);
	}

	/**
	 * Declares attribute labels.
	 */
	public function attributeLabels()
	{
		return array(
			'username'   => 'Email Address',
			'password'   => 'Password',
			'rememberMe' => 'Keep me logged in',
		);
	}

	/**
	 * Authenticates the password.
	 * This is the 'authenticate' validator as declared in rules().
	 *
	 * @param string $attribute
	 * @param string $params
	 *
	 * @return bool
	 */
	public function authenticate( $attribute, $params )
	{
		if ( 'password' != $attribute )
		{
			$this->addError( static::ERROR_ATTRIBUTE, 'Invalid authentication request' );

			return false;
		}

		return !$this->hasErrors() && $this->login();
	}

	/**
	 * Authenticates the password.
	 * This is the 'authenticate' validator as declared in rules().
	 */
	protected function _authenticateDrupal( $attribute, $params )
	{
		$this->_drupalIdentity = new DrupalUserIdentity( $this->username, $this->password );

		if ( $this->_drupalIdentity->authenticate() )
		{
			return true;
		}

		$this->addError( static::ERROR_ATTRIBUTE, static::ERROR_MESSAGE );

		return false;
	}

	/**
	 * Logs in the user using the given username and password in the model.
	 *
	 * @return boolean whether login is successful
	 */
	public function login()
	{
		$_identity =
			( $this->_drupalAuth
				? ( $this->_drupalIdentity ? : new DrupalUserIdentity( $this->username, $this->password ) ) : ( $this->_identity
					? : new PlatformUserIdentity( $this->username, $this->password ) ) );

		if ( !$this->_processLogin( $_identity ) )
		{
			$this->addError( static::ERROR_ATTRIBUTE, static::ERROR_MESSAGE );

			return false;
		}

		return ( PlatformUserIdentity::ERROR_NONE == $_identity->errorCode );
	}

	/**
	 * Logs in the user using the given username and password in the model.
	 * Sets no errors, just return true or false
	 *
	 * @param PlatformUserIdentity|DrupalUserIdentity $identity     The identity to work on
	 * @param bool                                    $authenticate If true, identity will be authenticated
	 * @param bool                                    $login        If true, or if $authenticate is false, identity
	 *                                                              will be logged in. After login, this form's $sessionData
	 *                                                              property is populated with the DSP session data.
	 *
	 * @return bool
	 */
	protected function _processLogin( $identity, $authenticate = true, $login = true )
	{
		if ( $authenticate )
		{
			if ( !$identity->authenticate() )
			{
				return false;
			}
		}

		if ( !$authenticate || $login )
		{
			if ( PlatformUserIdentity::ERROR_NONE == $identity->errorCode )
			{
				$_duration = $this->rememberMe ? 3600 * 24 * 30 : 0;

				if ( !Pii::user()->login( $identity, $_duration ) )
				{
					return false;
				}

				/** @var PlatformUserIdentity $_identity */
				$this->_sessionData = Session::generateSessionFromIdentity( $identity );
			}
		}

		return true;
	}

	/**
	 * @param DrupalUserIdentity $drupalIdentity
	 *
	 * @return LoginForm
	 */
	public function setDrupalIdentity( $drupalIdentity )
	{
		$this->_drupalIdentity = $drupalIdentity;

		return $this;
	}

	/**
	 * @return DrupalUserIdentity
	 */
	public function getDrupalIdentity()
	{
		return $this->_drupalIdentity;
	}

	/**
	 * @param PlatformUserIdentity $identity
	 *
	 * @return LoginForm
	 */
	public function setIdentity( $identity )
	{
		$this->_identity = $identity;

		return $this;
	}

	/**
	 * @return PlatformUserIdentity
	 */
	public function getIdentity()
	{
		return $this->_identity;
	}

	/**
	 * @param boolean $drupalAuth
	 *
	 * @return LoginForm
	 */
	public function setDrupalAuth( $drupalAuth )
	{
		$this->_drupalAuth = $drupalAuth;

		return $this;
	}

	/**
	 * @return boolean
	 */
	public function getDrupalAuth()
	{
		return $this->_drupalAuth;
	}

	/**
	 * @param array $sessionData
	 *
	 * @return LoginForm
	 */
	public function setSessionData( $sessionData )
	{
		$this->_sessionData = $sessionData;

		return $this;
	}

	/**
	 * @return array
	 */
	public function getSessionData()
	{
		return $this->_sessionData;
	}

}
