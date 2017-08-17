$('#new-msg').keypress(function (e) {
	if (e.which == 13) {
		$('#send-msg').click();
		return false;  
	}
});

$('#send-msg').on('click', function(){
	$('#chats').append(' <div class="msg you-sent"><span class="msg-owner">You : </span>				<span class="msg-text">' + $("#new-msg").val() + ' </span></div>');
	$('#new-msg').val("");
});

/* nav bar handling */
$('#open_groups_nav').on('click', function(){
	$('#groups_nav').toggleClass('hidden');
	$('#groups_panel_back').toggleClass('hidden');
});
$('#groups_panel_back').on('click', function(){
	$('#groups_nav').toggleClass('hidden');
	$('#groups_panel_back').toggleClass('hidden');
});

/* Open User Options */
$('#user_btn').on('click', function(){
	$('#user_popup').toggleClass('hidden');
});

/* Logout event */
$("#logout_btn").on("click", (e) => {
	e.preventDefault();
	logout()
});

/* Open profile page */
	
$("#profile_btn").on("click", (e) => {
	e.preventDefault();
	get_profile();
});
