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
