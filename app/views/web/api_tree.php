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
use DreamFactory\Platform\Scripting\SwaggerParser;
use DreamFactory\Platform\Yii\Models\Provider;
use DreamFactory\Yii\Utility\Pii;

/**
 * @var WebController $this
 * @var LoginForm     $model
 * @var bool          $redirected
 * @var CActiveForm   $form
 * @var Provider[]    $loginProviders
 */
$_html = null;

CHtml::$errorSummaryCss = 'alert alert-danger';

$_tree = SwaggerParser::getApiObject( false );
$_html = null;

Pii::css(
    'api-tree',
    <<<CSS
.tree {
    min-height:20px;
    padding:19px;
    margin-bottom:20px;
    background-color:#fbfbfb;
    border:1px solid #999;
    -webkit-border-radius:4px;
    -moz-border-radius:4px;
    border-radius:4px;
    -webkit-box-shadow:inset 0 1px 1px rgba(0, 0, 0, 0.05);
    -moz-box-shadow:inset 0 1px 1px rgba(0, 0, 0, 0.05);
    box-shadow:inset 0 1px 1px rgba(0, 0, 0, 0.05)
}
.tree-inverse {
    color: #222;
}
.tree li {
    list-style-type:none;
    margin:0;
    padding:10px 5px 0 5px;
    position:relative;
    width: 100%;
}
.tree li::before, .tree li::after {
    content:'';
    left:-20px;
    position:absolute;
    right:auto
}
.tree li::before {
    border-left:1px solid #999;
    bottom:50px;
    height:100%;
    top:0;
    width:1px
}
.tree li::after {
    border-top:1px solid #999;
    height:20px;
    top:25px;
    width:25px
}
.tree li span {
    -moz-border-radius:4px;
    -webkit-border-radius:4px;
    border:1px solid #999;
    border-radius:4px;
    display:inline-block;
    padding:3px 8px;
    text-decoration:none
}
.tree li span i.fa {
    margin-right: 8px;
}
.tree li.parent_li>span {
    cursor:pointer
}
.tree>ul>li::before, .tree>ul>li::after {
    border:0
}
.tree li:last-child::before {
    height:30px
}
.tree li.parent_li>span:hover, .tree li.parent_li>span:hover+ul li span {
    background:#eee;
    border:1px solid #94a0b4;
    color:#000
}
CSS
);

$_tree = (array)$_tree;
ksort( $_tree );

foreach ( $_tree as $_service => $_operations )
{
    $_lines = null;

    $_operations = (array)$_operations;
    ksort( $_operations );

    foreach ( array_keys( $_operations ) as $_operation )
    {
        $_lines .= '<li style="display: none;"><span><code>' . $_service . '.' . $_operation . '</code></span></li>';
    }

    $_html .= '<li><span><i class="fa fa-plus-circle"></i><strong>' . $_service . '</strong></span><ul>' . $_lines . '</ul></li>';
}
?>
<div class="box-wrapper">
    <div id="formbox" class="form-light boxed drop-shadow lifted">
        <h2 class="inset">Scripting API</h2>

        <div class="panel-group" id="api-tree">
            <div class="tree tree-inverse">
                <ul><?php echo $_html; ?></ul>
            </div>
        </div>
    </div>
</div>

<script type="application/javascript">
jQuery(
    function ($) {
        $('.tree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Collapse this branch');
        $('.tree li.parent_li > span').on(
            'click', function (e) {
                var children = $(this).parent('li.parent_li').find(' > ul > li');
                if (children.is(":visible")) {
                    children.hide('fast');
                    $(this).attr('title', 'Expand this branch').find(' > i').addClass('fa-plus-circle').removeClass('fa-minus-circle');
                } else {
                    children.show('fast');
                    $(this).attr('title', 'Collapse this branch').find(' > i').addClass('fa-minus-circle').removeClass('fa-plus-circle');
                }
                e.stopPropagation();
            }
        );
    }
);
</script>