<?php
/**
 * @author Yaron Koren
 * @file
 * @ingroup PF
 */

/**
 * Represents the "free text" in a wiki page, i.e. the text not in
 * pre-defined template calls and sections.
 */
class PFWikiPageFreeText {
	private $mText;
	private $mOptions;

	function __construct( $options = [] ) {
		$this->mOptions = $options;
	}

	function setText( $text ) {
		$this->mText = $text;
	}

	function isTranslateEnabled() {
		return class_exists('SpecialTranslate');
	}

	function getText() {
		$text = $this->mText;
		if ( $this->isTranslateEnabled() && isset($this->mOptions['translatable']) && $this->mOptions['translatable']) {

			//first remove any occurences of <translate> or </translate>
			$text = str_replace(['<translate>', '</translate>'], '', $text);
			//add translate tag
			$text = '<translate>' . $text .'</translate>';
		}
		return $text;
	}

	function getOptions() {
		return $this->mOptions;
	}

	function setOptions( $options ) {
		$this->mOptions = $options;
	}
}