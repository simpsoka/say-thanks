$ ->	

  # a small dash of sloppy jquery code
  $('body').addClass 'loaded'

	$("input:submit").click ->
		$('form').submit()
		$(@).val "Sending..."
		$("input:submit").attr "disabled", true

	$('.prop-list a').click ->
		$('#prop-input').val $(@).parent('li').index()
		$.pageTransition('slide', false, 0, $('#form-page-2'), $('#form-page-1')).then ->
  		$(".chzn-select").chosen()