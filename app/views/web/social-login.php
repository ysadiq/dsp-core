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
        'errorPlacement' => 'function(error,element){error.appendTo(element.closest("div.form-group"));}',
        'rules'          => array(
            'LoginForm[username]' => 'required email',
            'LoginForm[password]' => array(
                'minlength' => 3
            ),
        ),
        'messages'       => array(
            'LoginForm[username]' => 'Please enter a non-bogus email address',
            'LoginForm[password]' => array(
                'required'  => 'You must enter a password to continue',
                'minlength' => 'Your password must be at least 3 characters long',
            ),
        ),
    )
);

$_checkboxClass = !empty( $model->rememberMe ) ? 'fa-check-circle-o' : 'fa-times-circle-o';

$_rememberMeCopy = Pii::getParam( 'login.remember_me_copy', 'Remember Me' );

//*************************************************************************
//	Build the remote login provider icon list..
//*************************************************************************

$_providerHtml = null;
$_providerHider = 'hide';

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

        $_providerHtml .= '<i class="fa fa-' . $_icon . ' fa-3x" data-provider="' . $_provider->api_name . '"></i>';
    }

    $_providerHider = !empty( $_providerHtml ) ? null : ' hide ';

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

    <h4 style="text-align:center;">You must be logged in to continue</h4>

    <?php echo $_flash; ?>
    <?php echo CHtml::errorSummary( $model, '<strong>Sorry Charlie...</strong>' ); ?>

    <form id="login-form" method="POST" role="form">
        <input type="hidden" name="login-only" value="<?php echo $redirected ? 1 : 0; ?>">
        <input type="hidden" name="forgot" id="forgot" value="0">
        <input type="hidden" name="check-remember-ind" id="check-remember-ind" value="<?php echo $model->rememberMe ? 1 : 0; ?>">

        <div class="form-group">
            <label for="LoginForm_username" class="sr-only">DSP Email Address</label>

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

                <input tabindex="2" class="form-control required" type="password" id="LoginForm_password" name="LoginForm[password]"
                    autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="false" placeholder="Password" value="" />
            </div>
        </div>

        <div class="form-group">
            <div class="col-md-7" style="display: block; float: none; margin: 0 auto;">
                <div class="input-group remember-me">
                    <span class="input-group-addon bg-control remember-checkbox"><i class="fa fa-fw <?php echo $_checkboxClass; ?> fa-2x"></i></span>

                    <input tabindex="3" class="form-control strong-disabled" id="remember-control"
                        value="<?php echo ( $model->rememberMe ? null : 'Don\'t ' ) . $_rememberMeCopy; ?>" type="text"
                        disabled />
                    <div class="event-grabber" style="position:absolute; left:0; right:0; top:0; bottom:0; cursor: pointer;"></div>
                </div>
            </div>
        </div>

        <div class="remote-login <?php echo $_providerHider; ?>">
            <div class="remote-login-wrapper">
                <h4 style="">Sign-in with one of these providers</h4>

                <div class="remote-login-providers"><?php echo $_providerHtml; ?></div>
            </div>
        </div>

        <div class="form-buttons">
            <button type="submit" id="btn-submit" class="btn btn-success pull-right">Login</button>
            <button type="button" id="btn-forgot" class="btn btn-default pull-left">Forgot Password?</button>
        </div>
    </form>
</div>

<script type="text/javascript">
jQuery(
    function($) {
        var $_rememberMe = $('#check-remember-ind');
        var _wasRemembered = (1 == $_rememberMe.val());
        var $_rememberHint = $('#remember-control');
        var $_form = $('form#login-form');

        $('#btn-forgot').on(
            'click', function(e) {
                e.preventDefault();
                $('#LoginForm_password').removeProp('required').removeClass('required');
                $('input#forgot').val(1);
                $('form#login-form').submit();
            }
        );

        $('.input-group.remember-me, .event-grabber').on(
            'click', function(e) {
//                e.preventDefault();
                $('i.fa', $(this).closest('.input-group')).toggleClass('fa-check-circle-o fa-times-circle-o');
                $_rememberHint.val(( _wasRemembered ? 'Don\'t ' : '' ) + '<?php echo $_rememberMeCopy; ?>').toggleClass('remember-checked');
                $_rememberMe.val(_wasRemembered = !_wasRemembered);
                return false;
            }
        );
    }
);
</script>