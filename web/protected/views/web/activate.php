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
use DreamFactory\Yii\Utility\Validate;

/**
 * @var WebController $this
 * @var LoginForm     $model
 * @var CActiveForm   $form
 */

Validate::register(
	'form#login-form',
	array(
		 'ignoreTitle'    => true,
		 'errorClass'     => 'error',
		 'errorPlacement' => 'function(error,element){error.appendTo(element.parent("div"));error.css("margin","-10px 0 0");}',
	)
);

$_headline = ( isset( $activated ) && $activated ) ? 'Welcome!' : 'Activate Your New DSP!';
?>
<div class="container" id="formbox">
	<h2><?php echo $_headline; ?></h2>

	<p>Thank you for installing the DreamFactory Services Platform&trade;. This DSP needs to be activated in order to continue.
		If you haven't yet registered for a user account on <a href="https://www.dreamfactory.com">http://www.dreamfactory.com</a>,
		registration allows you to receive free technical support and is quick and easy, just click
		<a href="https://www.dreamfactory.com/user/register">here</a>.
	</p>

	<p>Once you've registered, you may enter those credentials below to speed up the activation process.
		Otherwise, select 'Skip' to manually proceed with activation.
	</p>

	<?php $form = $this->beginWidget(
		'CActiveForm',
		array(
			 'id'                     => 'login-form',
			 'enableClientValidation' => true,
			 'clientOptions'          => array(
				 'validateOnSubmit' => true,
			 ),
		)
	); ?>

	<input type="hidden" name="skipped" id="skipped" value="0">
	<div class="form-group">
		<label for="LoginForm_username" class="sr-only">Email Address</label>

		<div class="input-group">
			<span class="input-group-addon bg_dg"><i class="fa fa-envelope fa-fw"></i></span>

			<input tabindex="1" class="form-control email" autofocus type="email" id="LoginForm_username" name="LoginForm[username]"
				   placeholder="Email Address" />
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

	<?php echo $form->errorSummary( $model ); ?>

	<div class="form-buttons">
		<button id="btn-skip" class="btn btn-default pull-left">Skip</button>
		<button type="submit" class="btn btn-success pull-right">Activate</button>
	</div>

	<?php $this->endWidget(); ?>

</div>
<script type="text/javascript">
jQuery(function($) {
	$('#btn-skip').on('click', function(e) {
		e.preventDefault();
		$('input#skipped').val(1);
		$('form#login-form').submit();
	});
});
</script>