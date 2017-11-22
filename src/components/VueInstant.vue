<template>
<div>
    <div class="main">
      <form novalidate="novalidate" onsubmit="return false;" :class="getFormClass">
        <div role="search" :class="getClassWrapper">
          <span class="icon-search"><i class="fa fa-search"></i></span>
          <input :disabled="disabled" @click="emitClickInput" @keyup='changeText' v-model='textVal' type="search" :name="name" placeholder="" autocomplete="off" required="required" :class="getClassInput" :autofocus="autofocus">
        </div>
      </form>
    </div>
    <div class="results">
      <div v-if="modeIsFull" class='el-input-group__append list-block'>
          <div class="vue-instant__suggestions container">
              <div @click="selectedAction(index)" v-for="(item, index) in suggestions"  class="infoblock col-sm-3" :class="getClassHighlighted(index)">
                <h4>{{item[suggestionAttribute]}}</h4>
                <div class="post-date hovercolor"><a :href="'/'+item[suggestionUsername]">{{item[suggestionUsername]}}</a>/<a :href="'/'+item[suggestionUsername]+'/'+item[suggestionAttribute]">{{item[suggestionAttribute]}}</a></div>
                <p class="blurb">{{item[suggestionDescription]}}</p>
              </div>
          </div>
      </div>
    </div>
</div>
</template>
<script>
  export default {
    name: 'vueInstant',
    props: {
      'value': {
        type: String,
        required: true
      },
      'suggestions': {
        type: Array,
        required: true
      },
      'suggestionAttribute': {
        type: String,
        required: true
      },
      'suggestionDescription': {
        type: String,
        required: true
      },
      'suggestionUsername': {
        type: String,
        required: true
      },
      'placeholder': {
        type: String,
        default: 'write something...'
      },
      'minMatch': {
        type: Number,
        default: 1
      },
      'name': {
        type: String,
        default: 'vueInstant'
      },
      'autofocus': {
        type: Boolean,
        default: true
      },
      'disabled': {
        type: Boolean
      },
      'type': {
        type: String,
        default: 'google'
      },
      'showAutocomplete': {
        type: Boolean,
        default: true
      },
      'suggestOnAllWords': {
        type: Boolean,
	      default: false
      }
    },
    data () {
      return {
        selectedEvent: null,
        selectedSuggest: null,
        inputChanged: false,
        suggestionsIsVisible: true,
        highlightedIndex: 0,
        highlightedIndexMax: 7,
        similiarData: [],
        placeholderVal: this.placeholder,
        types: [{
          name: 'google',
          formClass: 'searchbox sbx-google',
          classWrapper: 'sbx-google__wrapper',
          classInput: 'sbx-google__input',
          classInputPlaceholder: 'sbx-google__input-placeholder',
          classSubmit: 'sbx-google__submit',
          classReset: 'sbx-google__reset',
          highlighClass: 'highlighted__google'
        }]
      }
    },
    computed: {
      getPlaceholder () {
        if (this.inputChanged || this.textValIsEmpty()) {
          return this.placeholderVal
        }
      },
      modeIsFull () {
        return this.showAutocomplete
      },
      showSuggestions () {
        return this.similiarData.length >= this.minMatch
      },
      getPropertiesClass () {
        var type = this.getType()
        return type.properties
      },
      getFormClass () {
        var type = this.getType()
        return type.formClass
      },
      getClassWrapper () {
        var type = this.getType()
        return type.classWrapper
      },
      getClassInput () {
        var type = this.getType()
        return type.classInput
      },
      getClassInputPlaceholder () {
        var type = this.getType()
        return type.classInputPlaceholder
      },
      getClassSubmit () {
        var type = this.getType()
        return type.classSubmit
      },
      getClassReset () {
        var type = this.getType()
        return type.classReset
      },
      textVal: {
        get () {
          return this.value
        },
        set (v) {
          this.$emit('input', v)
        }
      }
    },
    methods: {
      decrementHighlightedIndex () {
        this.highlightedIndex -= 1
      },
      incrementHighlightedIndex () {
        this.highlightedIndex += 1
      },
      escapeAction () {
        this.emitEscape()
      },
      arrowRightAction () {
        this.emitKeyRight()
      },
      arrowDownAction () {
        if (this.arrowDownValidation()) {
          this.incrementHighlightedIndex()
          this.setPlaceholderAndTextVal()
          this.emitKeyDown()
        } else {
          this.clearHighlightedIndex()
        }
      },
      arrowUpAction () {
        if (this.highlightedIndex > 0) {
          this.decrementHighlightedIndex()
          this.setPlaceholderAndTextVal()
          this.emitKeyUp()
        } else {
          this.clearHighlightedIndex()
        }
      },
      enterAction () {
        this.setFinalTextValue()
        this.clearHighlightedIndex()
        this.emitEnter()
      },
      selectedAction (index) {
        this.highlightedIndex = index
        this.setFinalTextValue()
        this.emitSelected()
      },
      addRegister (o) {
        if (this.isSimilar(o) && this.textValIsNotEmpty()) {
          this.addSuggestion(o)
        }
      },
      addSuggestion (o) {
        if (!this.findSuggestionTextIsRepited(o)) {
          this.addToSimilarData(o)
        }
      },
      addToSimilarData (o) {
        if (this.canAddToSimilarData()) {
          this.placeholderVal = this.letterProcess(o)
          this.selectedSuggest = o
          this.emitSelected()
          this.similiarData.unshift(o)
        }
      },
      setTextValue (e) {
        if (e.target.value.trim()) {
          this.textVal = e.target.value
          this.emitChange()
        }
      },
      setSelectedAsTextValue () {
        this.textVal = this.selected
      },
      setInitialTextValue () {
        this.textVal = this.value
      },
      setFinalTextValue () {
        if (this.finalTextValueValidation()) {
          this.setPlaceholderAndTextVal()
          this.emitChange()
        }
      },
      setPlaceholderAndTextVal () {
        if (typeof this.similiarData[this.highlightedIndex] !== 'undefined') {
          var suggest = this.similiarData[this.highlightedIndex]
          this.placeholderVal = suggest[this.suggestionAttribute]
          this.textVal = suggest[this.suggestionAttribute]
          this.selectedSuggest = suggest
          this.emitSelected()
        }
      },
      setInitialPlaceholder () {
        this.placeholderVal = this.placeholder
      },
      getType () {
        return this.types.find(this.isSameType)
      },
      getClassHighlighted (index) {
        if (this.highlightedIndex === index) {
          var type = this.getType()
          return type.highlighClass
        }
      },
      letterProcess (o) {
        var remoteText = o[this.suggestionAttribute].split('')
        var inputText = this.textVal.split('')
        inputText.forEach(function (letter, key) {
          if (letter !== remoteText[key]) {
            remoteText[key] = letter
          }
        })
        return remoteText.join('')
      },
      findSuggests () {
        if (this.suggestionsPropIsDefined()) {
          this.suggestions.forEach(this.addRegister)
        }
      },
      arrowDownValidation () {
        return this.highlightedIndex < this.highlightedIndexMax &&
               this.highlightedIndex < (this.similiarData.length - 1)
      },
      lowerFirst (string) {
        return string.charAt(0).toLowerCase() + string.slice(1)
      },
      controlEvents () {
        var uncaptz = this.lowerFirst(this.selectedEvent + 'Action')
        var fnName = (this[uncaptz])
        if (this.fnExists(fnName)) {
          fnName()
        }
      },
      findRepited (similarItem, o) {
        return (similarItem[this.suggestionAttribute] ===
        o[this.suggestionAttribute])
      },
      findSuggestionTextIsRepited (o) {
        return this.similiarData.find(this.findRepited.bind(this, o))
      },
      finalTextValueValidation () {
        return typeof this.similiarData[this.highlightedIndex] !== 'undefined' ||
            this.placeholderVal === '' && this.highlightedIndex !== 0
      },
      isSimilar (o) {
          if (o) {
	   if (this.suggestOnAllWords) {
	      var isMatch = false;
	      var words = o[this.suggestionAttribute].split(' ');
	      var textValWords = this.textVal.split(" ");
	      if ( words.length > 0) {
		  words.forEach(function(word)  {
		      if ( textValWords.length > 0) {
			  textValWords.forEach(function(textValWord) {
			      if (word.toLowerCase().startsWith(textValWord.toLowerCase())) {
				  isMatch = true;
			      }
			  });
		      }
		      else if (word.toLowerCase().startsWith(this.textVal.toLowerCase())) {
			  isMatch = true;
		      }
		  });
		  return isMatch;
	      } 
	   }

           return o[this.suggestionAttribute]
        	  .toLowerCase()
            .startsWith(this.textVal.toLowerCase())		  


        }
      },
      isSameType (o) {
        return o.name === this.type
      },
      fnExists (fnName) {
        return typeof fnName === 'function'
      },
      canAddToSimilarData () {
        return this.similiarData.length < this.highlightedIndexMax
      },
      suggestionsPropIsDefined () {
        return typeof this.suggestions !== 'undefined'
      },
      notArrowKeysEvent () {
        return this.selectedEvent !== 'ArrowUp' &&
                this.selectedEvent !== 'ArrowDown' && this.selectedEvent !== 'ArrowRight'
      },
      notEnterKeyEvent () {
        return this.selectedEvent !== 'Enter'
      },
      textValIsEmpty () {
        return this.textVal === ''
      },
      textValIsNotEmpty () {
        return this.textVal !== ''
      },
      clearValue () {
        this.textVal = ''
      },
      clearSelected () {
        this.selected = null
      },
      clearSelectedSuggest () {
        this.selectedSuggest = null
      },
      clearHighlightedIndex () {
        this.highlightedIndex = 0
      },
      changeText (e) {
        let boxWidth = 'width:' + (35 + this.value.length * 18) + 'px;'
        document.querySelector(
          `.${this.getClassInput}`
        ).style = boxWidth
        document.querySelector(
          `.${this.getClassWrapper}`
        ).style = boxWidth
        this.selectedEvent = e.code
        this.setTextValue(e)
        this.processChangeText()
        this.controlEvents(e)
      },
      processChangeText (e) {
        if (this.notEnterKeyEvent()) {
          this.inputChanged = true
          this.suggestionsIsVisible = true
        }
      },
      emitChange () {
        // this.$emit('input', this.textVal)
      },
      emitClickInput (event) {
        this.$emit('click-input', event)
      },
      emitClickButton (event) {
        this.$emit('click-button', this.textVal)
      },
      emitEnter () {
        this.$emit('enter')
      },
      emitKeyUp () {
        this.$emit('key-up')
      },
      emitKeyDown () {
        this.$emit('key-down', this.selectedSuggest)
      },
      emitKeyRight () {
        this.$emit('key-right')
      },
      emitClear () {
        this.$emit('clear')
      },
      emitEscape () {
        this.$emit('escape')
      },
      emitSelected () {
        this.$emit('selected', this.selectedSuggest)
      }
    }
}

</script>

<style>
/*  google */
.sbx-google {
  display: inline-block;
  position: relative;
  width: 500px;
  height: 41px;
  white-space: nowrap;
  box-sizing: border-box;
  font-size: 14px;
}

.sbx-google__wrapper {
  width: 100%;
  height: 100%;
}

.sbx-google__input {
  display: inline-block;
  position: absolute !important;
  left: 0 !important;
  top:0 !important;
  -webkit-transition: box-shadow .4s ease, background .4s ease;
  transition: box-shadow .4s ease, background .4s ease;
  border: 0;
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px #CCCCCC;
  background: rgba(255, 255, 255, 0);
  padding: 0;
  padding-left: 11px;
  width: 100%;
  height: 100%;
  vertical-align: middle;
  white-space: normal;
  font-size: inherit;
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;
}

.sbx-google__input-placeholder {
  display: inline-block;
  -webkit-transition: box-shadow .4s ease, background .4s ease;
  transition: box-shadow .4s ease, background .4s ease;
  border: 0;
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px #CCCCCC;
  background: #FFFFFF;
  padding: 0;
  padding-right: 77px;
  padding-left: 11px;
  width: 100%;
  height: 100%;
  vertical-align: middle;
  white-space: normal;
  font-size: inherit;
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;
}


.sbx-google__input::-webkit-search-decoration, .sbx-google__input::-webkit-search-cancel-button, .sbx-google__input::-webkit-search-results-button, .sbx-google__input::-webkit-search-results-decoration {
  display: none;
}

.sbx-google__input:hover {
  box-shadow: inset 0 0 0 1px #b3b3b3;
}

.sbx-google__input:focus, .sbx-google__input:active {
  outline: 0;
  box-shadow: inset 0 0 0 1px #3E82F7;
  background: rgba(255, 255, 255, 0)
}

.sbx-google__submit {
  position: absolute;
  top: 0;
  right: 0;
  left: inherit;
  margin: 0;
  border: 0;
  border-radius: 0 3px 3px 0;
  background-color: #3e82f7;
  padding: 0;
  width: 49px;
  height: 100%;
  vertical-align: middle;
  text-align: center;
  font-size: inherit;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
}

.sbx-google__submit::before {
  display: inline-block;
  margin-right: -4px;
  height: 100%;
  vertical-align: middle;
  content: '';
}

.sbx-google__submit:hover, .sbx-google__submit:active {
  cursor: pointer;
}

.sbx-google__submit:focus {
  outline: 0;
}

.sbx-google__reset {
  display: none;
  position: absolute;
  top: 10px;
  right: 56px;
  margin: 0;
  border: 0;
  background: none;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
  fill: rgba(0, 0, 0, 0.5);
}

.sbx-google__reset:focus {
  outline: 0;
}

.sbx-google__input:valid ~ .sbx-google__reset {
  display: block;
  -webkit-animation-name: sbx-reset-in;
          animation-name: sbx-reset-in;
  -webkit-animation-duration: .15s;
          animation-duration: .15s;
}

@-webkit-keyframes sbx-reset-in {
  0% {
    -webkit-transform: translate3d(-20%, 0, 0);
            transform: translate3d(-20%, 0, 0);
    opacity: 0;
  }
  100% {
    -webkit-transform: none;
            transform: none;
    opacity: 1;
  }
}

@keyframes sbx-reset-in {
  0% {
    -webkit-transform: translate3d(-20%, 0, 0);
            transform: translate3d(-20%, 0, 0);
    opacity: 0;
  }
  100% {
    -webkit-transform: none;
            transform: none;
    opacity: 1;
  }
}

.vue-instant__suggestions {
     position: absolute;
     left: 0;
     top: 110%;
     margin: 0;
     background-color: #fff;
     border: 1px solid #D3DCE6;
     width: 100%;
     padding: 6px 0;
     z-index: 10;
     border-radius: 2px;
     max-height: 280px;
     box-sizing: border-box;
     overflow: auto;
     box-shadow: 0 0 6px 0 rgba(0,0,0,.04), 0 2px 4px 0 rgba(0,0,0,.12);
     margin-top:3px;
 }

 .vue-instant__suggestions li {
     list-style: none;
     line-height: 36px;
     padding: 0 10px;
     margin: 0;
     cursor: pointer;
     color: #475669;
     font-size: 14px;
     white-space: nowrap;
     overflow: hidden;
     text-overflow: ellipsis;
 }

 .vue-instant__suggestions li.highlighted__spotify {
     background-color: black;
     color: #fff;
 }

 .vue-instant__suggestions li.highlighted__twitter {
     background-color: #20a0ff;
     color: #fff;
 }

 .vue-instant__suggestions li.highlighted__google {
     background-color: #EEEEEE;
     color: black;
 }

 .vue-instant__suggestions li.highlighted__facebook {
     background-color: #3e5da0;
     color: #fff;
 }

 .vue-instant__suggestions li.highlighted__amazon {
     background-color: #232F3E;
     color: #fff;
 }


 .el-input-group__append {
   border: 0px !important;
 }

.sbx-custom__input {
  position: absolute;
  left: 0 !important;
  background: rgba(255, 255, 255, 0) !important;
}
</style>
