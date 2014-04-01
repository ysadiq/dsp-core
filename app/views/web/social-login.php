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

$_html = null;

Validate::register(
    'form#login-form',
    array(
        'ignoreTitle'    => true,
        'errorClass'     => 'error',
        'errorPlacement' => 'function(error,element){error.appendTo(element.closest("div.form-group"));error.css("margin","-10px 0 0");}',
        'rules'          => array(
            'LoginFormForm[username]' => array(
                'required'  => true,
                'email'     => true,
                'minlength' => 5,
            ),
        ),
    )
);

$_checkboxClass = !empty( $model->rememberMe ) ? 'fa-check-circle-o' : 'fa-times-circle-o';

Pii::cssFile( '/css/login.css', 'all' );
Pii::cssFile( '/css/remote-login.css', 'all' );

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

if ( null !== ( $_flash = Pii::getFlash( 'login-form' ) ) )
{
    $_flash = <<<HTML
<div class="alert alert-success">
	{$_flash}
</div>
HTML;
}
?>
<div class="container" id="formbox">
    <h2>User Login</h2>

    <h4 style="text-align:center;">Please sign in for access to the requested resource</h4>

    <?php echo $_flash; ?>
    <?php echo CHtml::errorSummary( $model ); ?>

    <form id="login-form" method="POST" role="form">
        <input type="hidden" name="login-only" value="<?php echo $redirected ? 1 : 0; ?>">
        <input type="hidden" name="forgot" id="forgot" value="0">
        <input type="hidden" name="check-remember-ind" id="check-remember-ind" value="<?php echo $model->rememberMe ? 1 : 0; ?>">

        <div class="form-group">
            <label for="LoginForm_username" class="sr-only">DSP User Email Address</label>

            <div class="input-group">
                <span class="input-group-addon bg_dg bg-control"><i class="fa fa-fw fa-envelope fa-2x"></i></span>

                <input tabindex="1" required class="form-control" autofocus type="email" id="LoginForm_username"
                       name="LoginForm[username]" placeholder="DSP User Email Address"
                       spellcheck="false" autocapitalize="off" autocorrect="off"
                       value="<?php echo $model->username; ?>" />
            </div>
        </div>

        <div class="form-group">
            <label for="LoginForm_password" class="sr-only">Password</label>

            <div class="input-group">
                <span class="input-group-addon bg_ly bg-control"><i class="fa fa-fw fa-lock fa-2x"></i></span>

                <input tabindex="2" class="form-control" type="password" id="LoginForm_password" name="LoginForm[password]"
                       autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="false" placeholder="Password" value="" />
            </div>
        </div>

        <div class="form-group">
            <div class="col-md-7" style="display: block; float: none; margin: 0 auto;">
                <div class="input-group remember-me">
                    <span class="input-group-addon bg-control remember-checkbox"><i class="fa fa-fw <?php echo $_checkboxClass; ?> fa-2x"></i></span>

                    <input tabindex="3" class="form-control strong-disabled" id="remember-control"
                           placeholder="<?php echo( $model->rememberMe ? null : 'Do Not ' ); ?>Remember Me" type="text"
                           disabled />
                </div>
            </div>
        </div>

        <div class="remote-login hide">
            <div class="remote-login-wrapper">
                <h4 style="">Sign-in with one of these providers</h4>

                <div class="remote-login-providers"></div>
            </div>
        </div>

        <div class="form-buttons">
            <button type="submit" id="btn-submit" class="btn btn-success pull-right">Login</button>
            <button type="button" id="btn-forgot" class="btn btn-default pull-left">Forgot Password?</button>
        </div>
    </form>
</div>

<script type="text/javascript">
jQuery(function($) {
    var $_rememberMe = $('#check-remember-ind');
    var _remembered = (1 == $_rememberMe.val());
    var $_rememberHint = $('#remember-control');
    var $_form = $('form#login-form');

    $('#btn-forgot').on('click', function(e) {
        e.preventDefault();
        $('input#forgot').val(1);
        $('form#login-form').submit();
    });

    $_form.on('blur focusin focus invalid-form', function(e) {
        if (e.type != 'invalid-form' && $_form.validate().valid()) {
            $('#btn-submit').removeClass('disabled').removeAttr('disabled');
        } else {
            $('#btn-submit').addClass('disabled').attr({disabled: 'disabled'});
        }
    });

    $('.input-group.remember-me').on('click', function(e) {
        e.preventDefault();
        var $_icon = $('i.fa', $(this));

        if (_remembered) {
            //	Disable
            _remembered = 0;
            $_icon.toggleClass('fa-check-circle-o fa-times-circle-o');
            $_rememberHint.attr({placeHolder: 'Do Not Remember Me'}).toggleClass('remember-checked');
        } else {
            //	Enable
            _remembered = 1;
            $_icon.toggleClass('fa-check-circle-o fa-times-circle-o');
            $_rememberHint.attr({placeHolder: 'Remember Me'}).toggleClass('remember-checked');
        }

        $_rememberMe.val(_remembered);
    });
});
</script>