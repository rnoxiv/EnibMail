(function () {
    'use strict';

    angular
        .module('app')
        .controller('Mailbox.IndexController', Controller);

    function Controller(UserService, FlashService, $scope, $location, $http) {
        var vm = this;
		
        vm.user = null;
		vm.userToSend = null;
		
		vm.saveUser = saveUser;
		vm.sendMail = sendMailToUser;

		$scope.composeEmail = {};
		$scope.showTransfer = false;
		$scope.dossierCourant = null;
		$scope.emailSelectionne = null;
        initController();
		
        function initController() {
            // get current user
            UserService.GetCurrent()
				.then(function (user) {
					vm.user = user;			
				});
        }
		
		function sendMailToUser(username, mail){
			UserService.GetByUsername(username)
				.then(function (user){
					vm.userToSend = user;
					mail.id = $scope.lastIdMail(vm.userToSend);
					mail.statut = "unread";
					for (var i in vm.userToSend.mailbox){
						if (vm.userToSend.mailbox[i].value == "inbox") {
							vm.userToSend.mailbox[i].emails.unshift(mail);
							vm.saveUser(vm.userToSend);
							break;
						}
					}
					FlashService.Success('Mail succesfully sent');
				})
				.catch(function (error) {
                    FlashService.Error('Error, '+ username + ' ' +error + ', mail couldnt be delivered');
                });
		}
		
		function saveUser(user) {
            UserService.Update(user)
                .then(function () {
					console.log('user updated');
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }
		
		$scope.addMailToValueBox = function(value, email) {
		    for (var i in vm.user.mailbox){
				if (vm.user.mailbox[i].value == value) {
					vm.user.mailbox[i].emails.unshift(email);
					console.log(email);
					vm.saveUser(vm.user);
					break;
				}
			}
		}
		


		$scope.deleteMail = function(email) {
			for (var i in vm.user.mailbox){
				$scope.count = 0;
				for(var j in vm.user.mailbox[i].emails){
					if(vm.user.mailbox[i].emails[j].id == email.id){
						//var del = confirm("Are you sure you want to delete this mail?");
						//if(del){
							vm.user.mailbox[i].emails.splice(j,1);
							vm.saveUser(vm.user);
						//}
						break;
					}
					$scope.count++;
				}
			}
			$scope.emailSelectionne = null;
		}
		
		$scope.lastIdMail = function(user){
			$scope.IdMail = 0;
			for (var i in user.mailbox){
				for ( var j in user.mailbox[i].emails) {
					if(user.mailbox[i].emails[j].id >= $scope.IdMail)
						$scope.IdMail = user.mailbox[i].emails[j].id + 1;
				}
			}
			return $scope.IdMail;
		}
		
		$scope.reply = function(){
			$scope.composeEmail.from = vm.user.username;
			$scope.composeEmail.to = $scope.emailSelectionne.from;
			$scope.composeEmail.subject = 	"RE: " + $scope.emailSelectionne.subject;
			$scope.composeEmail.content = 
				"\n-------------------------------\n" 
				+ "from: " + $scope.emailSelectionne.from + "\n"
				+ "sent: " + $scope.emailSelectionne.date + "\n"
				+ "to: " + $scope.emailSelectionne.to + "\n"
				+ "subject: " + $scope.emailSelectionne.subject + "\n"
				+ $scope.emailSelectionne.content;
		}
		
		$scope.forward = function(){
			$scope.composeEmail.from = vm.user.username;
			$scope.composeEmail.subject = 	"Fwd: " + $scope.emailSelectionne.subject;
			$scope.composeEmail.content = 
				"\n-------------------------------\n" 
				+ "from: " + $scope.emailSelectionne.from + "\n"
				+ "sent: " + $scope.emailSelectionne.date + "\n"
				+ "to: " + $scope.emailSelectionne.to + "\n"
				+ "subject: " + $scope.emailSelectionne.subject + "\n"
				+ $scope.emailSelectionne.content;
		}
		
		$scope.composeMail = function(){
			$scope.composeEmail.from = vm.user.username;
		}
		
		$scope.sendEmail = function() {
			if($scope.composeEmail.content != null){
				$scope.composeEmail.date = Date.now();
				$scope.mailToSend = $scope.composeEmail;
				vm.sendMail($scope.composeEmail.to, $scope.mailToSend);
				$scope.composeEmail.id = $scope.lastIdMail(vm.user);
				for(var i in vm.user.mailbox){
					if(vm.user.mailbox[i].value == "sent"){
						$scope.composeEmail.statut = "read";
						$scope.addMailToValueBox(vm.user.mailbox[i].value, $scope.composeEmail);
					}
				}
			}
			$scope.composeEmail = {};
		}
		
		$scope.closeComposeMail = function() {
			if($scope.composeEmail.content != null){
				var closeMail = confirm('You are about to close this mail, would you like to conserve it for later?');
				if(closeMail){
					for(var i in vm.user.mailbox){
						if(vm.user.mailbox[i].value == "draft"){
							$scope.composeEmail.id = $scope.lastIdMail(vm.user);
							$scope.composeEmail.date = Date.now();
							$scope.composeEmail.statut = "read";
							$scope.addMailToValueBox(vm.user.mailbox[i].value, $scope.composeEmail);
						}
					}
				}
			}
			$scope.composeEmail = {};
		}
		
		$scope.numUnreadMail = function(dossier) {
			$scope.num = 0;
			for(var i in dossier.emails){
				if(dossier.emails[i].statut == "unread"){
					$scope.num++;
				}
			}
			return $scope.num;
		}
		
		$scope.transferMail = function(value) {
			$scope.emailToTransfer = $scope.emailSelectionne;
			$scope.deleteMail($scope.emailSelectionne);
			$scope.addMailToValueBox(value, $scope.emailToTransfer);
			$scope.showTransferOptions();
		}
		
		$scope.versEmail = function(email) {
			$scope.selectionEmail(email);
		}

		$scope.selectionDossier = function(dossier) {
			$scope.dossierCourant = dossier;
			$scope.emailSelectionne = null;
			$scope.search=null;
		}
		
		$scope.selectionEmail = function(email) {
			$scope.emailSelectionne = email;
			if($scope.emailSelectionne.statut == "unread"){
				for(var i in vm.user.mailbox){
					for(var j in vm.user.mailbox[i].emails){
						if(vm.user.mailbox[i].emails[j].id == $scope.emailSelectionne.id){
							vm.user.mailbox[i].emails[j].statut = "read";
							vm.saveUser(vm.user);
						}
					}
				}
			}
		};
		
		$scope.watchCollection('vm.user.mailbox', function(){
			
		}
	}

})();