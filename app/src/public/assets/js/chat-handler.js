
$('#new-msg').keypress(function (e) {
	if (e.which == 13) {
		$('#send-msg').click();
		return false;  
	}
});

$('#send-msg').on('click', function(){
	$('#chats').append(' <div class="msg you-sent"><span class="msg-text">' + $("#new-msg").val() + ' </span></div>');
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
	$("#logout_btn").html("<span>Logging out ...</span>");
	logout()
});

/* Open profile page */	
$("#profile_btn").on("click", () => {
	$('#gp_con').removeClass('hidden');
	$('#p_con').removeClass('hidden');

	get_profile(
		(sdata) => {
			let data = JSON.parse(sdata);

			$('#profile_name').html(data["name"]);
			$('#profile_username').html('@'+data["username"]);
			$('#profile_about').html(data["about"]);
			$('#profile_email').html(data["email"]);
			$('#profile_mobile').html(data["mobile"]);
			$('#profile_id').html(app.user.id);
		},
		(edata) => {

		}
	);
});

/* Open Groups Page */
$("#groups_btn").on("click", (e) => {
	$('#gp_con').removeClass('hidden');
	$('#g_con').removeClass('hidden');
});

/* Close group profile */
$('#c_gp_con').on('click', function(){
	$('#gp_con').addClass('hidden');
	$('#p_con').addClass('hidden');
	$('#g_con').addClass('hidden');
});
