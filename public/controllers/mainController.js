/* 
*  Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. 
*  See LICENSE in the source repository root for complete license information. 
*/

(function () {
  angular
    .module('app')
    .controller('MainController', MainController);

  function MainController($scope, $http, $log, GraphHelper) {
    let vm = this;

    // View model properties
    vm.displayName;
    vm.emailAddress;
    vm.emailAddressSent;
    vm.requestSuccess;
    vm.requestFinished;

    // View model methods
    vm.sendMail = sendMail;
    vm.login = login;
    vm.logout = logout;
    vm.isAuthenticated = isAuthenticated;
    vm.initAuth = initAuth;

    /////////////////////////////////////////
    // End of exposed properties and methods.

    function initAuth() {
        // Check initial connection status.
        if (localStorage.token) {
            processAuth();
        }
    }

    // Set the default headers and user properties.
    function processAuth() {

        // let the authProvider access the access token
        authToken = localStorage.token;

        if (localStorage.getItem('user') === null) {

          // Get the profile of the current user.
          GraphHelper.me().then(function(user) {
            
            // Save the user to localStorage.
            localStorage.setItem('user', angular.toJson(user));

            vm.displayName = user.displayName;
            vm.emailAddress = user.mail || user.userPrincipalName;
          });
        } else {
          let user = angular.fromJson(localStorage.user);
            
          vm.displayName = user.displayName;
          vm.emailAddress = user.mail || user.userPrincipalName;
        }

    }

    vm.initAuth();    

    function isAuthenticated() {
      return localStorage.getItem('user') !== null;
    }

    function login() {
      GraphHelper.login();
    }

    function logout() {
      GraphHelper.logout();
    }

    // Send an email on behalf of the current user.
    function sendMail() {

      authToken = localStorage.token;       
        
      // Build the HTTP request payload (the Message object).
      var email = {
          Subject: 'Welcome to Microsoft Graph development with Angular and the Microsoft Graph Connect sample',
          Body: {
            ContentType: 'HTML',
            Content: getEmailContent()
          },
          ToRecipients: [
            {
              EmailAddress: {
                Address: vm.emailAddress
              }
            }
          ]
      };

      // Save email address so it doesn't get lost with two way data binding.
      vm.emailAddressSent = vm.emailAddress;
      GraphHelper.sendMail(email)
        .then(function (response) {
          $log.debug('HTTP request to the Microsoft Graph API returned successfully.', response);
          vm.requestSuccess = true;
          vm.requestFinished = true;
          $scope.$apply();
        }, function (error) {
          $log.error('HTTP request to the Microsoft Graph API failed.');
          vm.requestSuccess = false;
          vm.requestFinished = true;
          $scope.$apply();
        });

    };

    // Get the HTMl for the email to send.
    function getEmailContent() {
      return "<html><head> <meta http-equiv=\'Content-Type\' content=\'text/html; charset=us-ascii\'> <title></title> </head><body style=\'font-family:calibri\'> <p>Congratulations " + vm.displayName + ",</p> <p>This is a message from the Microsoft Graph Connect sample. You are well on your way to incorporating Microsoft Graph endpoints in your apps. </p> <h3>What&#8217;s next?</h3><ul><li>Check out <a href='https://developer.microsoft.com/graph/' target='_blank'>https://developer.microsoft.com/graph</a> to start building Microsoft Graph apps today with all the latest tools, templates, and guidance to get started quickly.</li><li>Use the <a href='https://developer.microsoft.com/graph/graph-explorer' target='_blank'>Graph explorer</a> to explore the rest of the APIs and start your testing.</li><li>Browse other <a href='https://github.com/microsoftgraph/' target='_blank'>samples on GitHub</a> to see more of the APIs in action.</li></ul> <h3>Give us feedback</h3> <ul><li>If you have any trouble running this sample, please <a href='https://github.com/microsoftgraph/angular-connect-sample/issues' target='_blank'>log an issue</a>.</li><li>For general questions about the Microsoft Graph API, post to <a href='https://stackoverflow.com/questions/tagged/microsoftgraph?sort=newest' target='blank'>Stack Overflow</a>. Make sure that your questions or comments are tagged with [microsoftgraph].</li></ul><p>Thanks and happy coding!<br>Your Microsoft Graph samples development team</p> <div style=\'text-align:center; font-family:calibri\'> <table style=\'width:100%; font-family:calibri\'> <tbody> <tr> <td><a href=\'https://github.com/microsoftgraph/angular-connect-sample\'>See on GitHub</a> </td> <td><a href=\'https://officespdev.uservoice.com/\'>Suggest on UserVoice</a> </td> <td><a href=\'https://twitter.com/share?text=I%20just%20started%20developing%20%23Angular%20apps%20using%20the%20%23MicrosoftGraph%20Connect%20sample!%20&url=https://github.com/microsoftgraph/angular-connect-sample\'>Share on Twitter</a> </td> </tr> </tbody> </table> </div>  </body> </html>";
    };
  };
})();