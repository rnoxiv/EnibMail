(function () {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller);

    function Controller(UserService, FlashService, $scope) {
        var vm = this;
		
        vm.user = null;
        initController();
		
		$scope.numUnreadMails;
		$scope.inbox = {};
		
        function initController() {
            // get current user
			$scope.numUnreadMails = 0;
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
				for(var i in vm.user.mailbox){
					if(vm.user.mailbox[i].value == "inbox"){
						$scope.inbox = vm.user.mailbox[i].emails.slice(0,5);
						for(var j in vm.user.mailbox[i].emails){
							if(vm.user.mailbox[i].emails[j].statut == "unread"){
								$scope.numUnreadMails++;
							}
						}
					}
				}
            });
        }
    }

})();