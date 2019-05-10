<?php
/**
 * @author Yaron Koren
 * @file
 * @ingroup PF
 */

/**
 * Represents a single parameter (name and value) within a template call
 * in a wiki page.
 */
class PFWikiPageTemplateParam {
	private $mName;
	private $mValue;
	private $mOptions;

	function __construct( $name, $value, $options = [] ) {
		$this->mName = $name;
		$this->mValue = $value;
		$this->mOptions = $options;
	}

	function getName() {
		return $this->mName;
	}

	function isTranslateEnabled() {
		return class_exists('SpecialTranslate');
	}

	function getValue() {
		$value = $this->mValue;
		if ( $this->isTranslateEnabled() && isset($this->mOptions['translatable']) && $this->mOptions['translatable']) {
			if( strpos($value, '<translate>') === false) {
				// fix : rearrange <!--T:<number>--> tags to avoid errors
				// 4 cases : 
				//		1 : text<tag> => text\n\n<tag>
				//		2 : <tag>text => <tag>\ntext
				//		3 : <tag>\n* => <tag>\n\n
				//		4 : \n*<tag> => \n\n<tag>
				$value = preg_replace(['#([^\s])(<!--T:\d+-->)#m', '#(<!--T:\d+-->)([^\s])#m', '#(<!--T:\d+-->)([\s]+)#m', '#([\s]+)(<!--T:\d+-->)#m'], ["$1\n\n$2", "$1\n$2", "$1\n", "\n\n$2"], $value);
				$value = '<translate>' . $value .'</translate>';
			}
		}
		return $value;
	}

	function setValue( $value ) {
		$this->mValue = $value;
	}

	function getOptions() {
		return $this->mOptions;
	}

	function setOptions( $options ) {
		$this->mOptions = $options;
	}
}
