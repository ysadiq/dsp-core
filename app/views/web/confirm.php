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
 * @var WebController   $this
 * @var ConfirmUserForm $model
 * @var CActiveForm     $form
 */

Validate::register(
	'form#confirm-user-form',
	array(
		 'ignoreTitle'    => true,
		 'errorClass'     => 'error',
		 'errorPlacement' => 'function(error,element){error.appendTo(element.parent("div"));error.css("margin","-10px 0 0");}',
		 'rules'          => array(
			 'ConfirmUserForm[email]'          => array(
				 'required'  => true,
				 'minlength' => 5,
			 ),
			 'ConfirmUserForm[code]'           => array(
				 'required' => true,
			 ),
			 'ConfirmUserForm[newPassword]'    => array(
				 'required'  => true,
				 'minlength' => 5,
			 ),
			 'ConfirmUserForm[repeatPassword]' => array(
				 'required'  => true,
				 'minlength' => 5,
				 'equalTo'   => '#ConfirmUserForm_newPassword',
			 ),
		 ),
	)
);
?>
<div class="container" id="formbox">
	<?php
	switch ( $model->getReason() )
	{
		case 'register':
			echo '<h2>Registration Confirmation</h2>';
			break;
		case 'invite':
			echo '<h2>Invitation Confirmation</h2>';
			break;
		default:
			echo '<h2>Password Reset Confirmation</h2>';
			break;
	}
	?>

	<p>All fields are required.</p>

	<?php
	$form = $this->beginWidget(
		'CActiveForm',
		array(
			 'id'                     => 'confirm-user-form',
			 'enableClientValidation' => true,
			 'clientOptions'          => array(
				 'validateOnSubmit' => true,
			 ),
		)
	);
	?>

	<input type="hidden" name="reason" id="reason" value="<?php echo( $model->getReason() ); ?>">

	<div class="form-group">
		<label for="ConfirmUserForm_email" class="sr-only">Email Address</label>

		<div class="input-group">
			<span class="input-group-addon bg_dg"><i class="fa fa-envelope fa-fw"></i></span>

			<input tabindex="1" class="form-control email required" autofocus type="email" id="ConfirmUserForm_email" name="ConfirmUserForm[email]"
				   placeholder="Email Address" />
		</div>
	</div>

	<div class="form-group">
		<label for="ConfirmUserForm_code" class="sr-only">Confirmation Code</label>

		<div class="input-group">
			<span class="input-group-addon bg_dg"><i class="fa fa-lock fa-fw"></i></span>

			<input tabindex="1" class="form-control required" autofocus type="password" id="ConfirmUserForm_code" name="ConfirmUserForm[code]"
				   placeholder="Confirmation Code" />
		</div>
	</div>
	<div class="form-group">
		<label for="ConfirmUserForm_newPassword" class="sr-only">New Password</label>

		<div class="input-group">
			<span class="input-group-addon bg_ly"><i class="fa fa-lock fa-fw"></i></span>

			<input tabindex="2" class="form-control password required" type="password" id="ConfirmUserForm_newPassword" name="ConfirmUserForm[newPassword]"
				   placeholder="New Password" />
		</div>
	</div>
	<div class="form-group">
		<label for="ConfirmUserForm_repeatPassword" class="sr-only">Verify New Password</label>

		<div class="input-group">
			<span class="input-group-addon bg_ly"><i class="fa fa-check fa-fw"></i></span>

			<input tabindex="3" class="form-control password required" type="password" id="ConfirmUserForm_repeatPassword"
				   name="ConfirmUserForm[repeatPassword]"
				   placeholder="Verify NewPassword" />
		</div>
	</div>

	<?php echo $form->errorSummary( $model ); ?>

	<div class="form-buttons">
		<button type="submit" class="btn btn-success pull-right">Save</button>
	</div>

	<?php $this->endWidget(); ?>
</div>
<script type="text/javascript">
jQuery(function($) {
});
</script>
