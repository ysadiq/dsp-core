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
use DreamFactory\Platform\Yii\Models\Provider;
use DreamFactory\Yii\Utility\Pii;
use DreamFactory\Yii\Utility\Validate;

/**
 * @var WebController $this
 * @var LoginForm     $model
 * @var bool          $redirected
 * @var CActiveForm   $form
 * @var Provider[]    $loginProviders
 */

Validate::register(
	'form#login-form',
	array(
		'ignoreTitle'    => true,
		'errorClass'     => 'error',
		'errorPlacement' => 'function(error,element){error.appendTo(element.parent("div.form-group"));error.css("margin","-10px 0 0");}',
	)
);

Pii::cssFile( '/css/login.css', 'all' );

//*************************************************************************
//	Build the remote login provider icon list..
//*************************************************************************

$_providerHtml = null;

if ( !empty( $loginProviders ) )
{
	foreach ( $loginProviders as $_provider )
	{
		if ( !$_provider->is_active || !$_provider->is_login_provider )
		{
			continue;
		}

		$_icon = strtolower( $_provider->api_name );

		//	Google icon has a different name
		if ( 'google' == $_icon )
		{
			$_icon = 'google-plus';
		}

		$_providerHtml .= '<i class="icon-' . $_icon . ' icon-3x" data-provider="' . $_provider->api_name . '"></i>';
	}

	if ( !empty( $_providerHtml ) )
	{
	}
	Pii::cssFile( 'css/remote-login.css' );
}

CHtml::$errorSummaryCss = 'alert alert-danger';

$_headline = 'User Login';
?>
<div class="container" id="formbox">
	<h2><?php echo $_headline; ?></h2>

	<?php if ( Yii::app()->user->hasFlash( 'login-form' ) ): ?>

		<div class="alert alert-success">
			<?php echo Yii::app()->user->getFlash( 'login-form' ); ?>
		</div>

	<?php else: ?>

		<p>In order to proceed to the requested resource, you must be logged in.</p>

		<?php
		$form = $this->beginWidget(
			'CActiveForm',
			array(
				'id'                     => 'login-form',
				'enableClientValidation' => true,
				'clientOptions'          => array(
					'validateOnSubmit' => true,
				),
			)
		);
		?>

		<?php echo $form->errorSummary(
			$model,
			'<strong>Please check your entries...</strong>',
			null,
			array( 'style' => 'margin-bottom: 15px;' )
		); ?>

		<input type="hidden" name="login-only" value="<?php echo $redirected ? 1 : 0; ?>">
		<input type="hidden" name="forgot" id="forgot" value="0">
		<input type="hidden" name="check-remember-ind" id="check-remember-ind" value="<?php echo $model->rememberMe ? 1 : 0; ?>">

		<div class="form-group">
			<label for="LoginForm_username" class="sr-only">DSP User Email Address</label>

			<div class="input-group">
				<span class="input-group-addon bg_dg"><i class="fa fa-envelope fa-fw"></i></span>

				<input tabindex="1" class="form-control email" autofocus type="email" id="LoginForm_username" name="LoginForm[username]"
					   placeholder="DSP User Email Address" />
			</div>
		</div>
		<div class="form-group">
			<label for="LoginForm_password" class="sr-only">Password</label>

			<div class="input-group">
				<span class="input-group-addon bg_ly"><i class="fa fa-lock fa-fw"></i></span>

				<input tabindex="2" class="form-control password" type="password" id="LoginForm_password" name="LoginForm[password]"
					   placeholder="Password" />
			</div>
		</div>

		<div class="form-group">
			<div class="input-group remember-me">
				<span class="input-group-addon bg_db"><i class="fa fa-<?php echo !empty( $model->rememberMe ) ? 'check-' : null; ?>circle-o fa-fw"></i></span>

				<input tabindex="3" class="form-control strong-disabled" id="remember-control"
					   placeholder="<?php echo( $model->rememberMe ? null : 'Do Not ' ); ?>Keep Me Signed In" type="text"
					   disabled />
			</div>
		</div>

		<div class="remote-login hide">
			<div class="remote-login-wrapper">
				<h4 style="">Sign-in with one of these providers</h4>

				<div class="remote-login-providers" data-owner="#loginDialog"></div>
			</div>
		</div>
		<div class="form-buttons">
			<button type="submit" class="btn btn-success pull-right">Login</button>
			<button type="button" id="btn-forgot" class="btn btn-default pull-left">Forgot Password?</button>
		</div>

		<?php $this->endWidget(); ?>
	<?php endif; ?>
</div>
<script type="text/javascript">
jQuery(function($) {
	var $_rememberMe = $('#check-remember-ind');
	var _remembered = ( 1 == $_rememberMe.val());
	var $_rememberHint = $('#remember-control');

	$('#btn-forgot').on('click', function(e) {
		e.preventDefault();
		$('input#forgot').val(1);
		$('form#login-form').submit();
	});

	$('.input-group.remember-me').on('click', function(e) {
		e.preventDefault();
		var $_icon = $('i.fa', $(this));

		if (_remembered) {
			//	Disable
			_remembered = 0;
			$_icon.removeClass('fa-check-circle-o').addClass('fa-circle-o');
			$_rememberHint.attr({placeHolder: 'Do Not Keep Me Signed In'});
		}
		else {
			//	Enable
			_remembered = 1;
			$_icon.removeClass('fa-circle-o').addClass('fa-check-circle-o');
			$_rememberHint.attr({placeHolder: 'Keep Me Signed In'});
		}

		$_rememberMe.val(_remembered);
	});
});
</script>