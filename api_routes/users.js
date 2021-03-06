
exports.create = function (req, res) {
	var user_obj = req.body;
	var user_id = user_obj.user_id;
	db.users.find({user_id: user_id}, function (error, response) {
		if (response.length) {
			res.send(response);
		} else {
			db.users.insert(user_obj, function (error, response) {
				if (error) {
					res.json({
						400 : {
							error: "Could Not Create User" 
						}
					})
				} else {
					console.log('success')
					res.send(response);
				}
			});
		}
	});
}

exports.getUser = function (req, res) {
	var user_id = req.params.user_id;
	db.users.find({user_id: user_id}, function (error, response) {
		if (error) {
			res.json({
				400 : {
					error: "User Not Found" 
				}
			})
		} else {
			res.send(response);
		}
	});
}

exports.login = function (req, res) {
	console.log('logging in');
	console.log(req.headers);
	res.json({'user': 'Brian Noah'})
}