var corsAnywhere = "https://cors-anywhere.herokuapp.com/";

function populateReadItems() {
  var consumerKey = document.getElementById("consumerKeyId").value;

  if(sessionStorage.getItem("access_token"))
    getReadItems(consumerKey);
  else if(sessionStorage.getItem("code"))
    requestAccessToken(consumerKey);
  else 
    requestOAuthCode(consumerKey);
}

//Has the side effect of saving the code in sessionStorage and redirecting to authorization.
function requestOAuthCode(consumerKey) {
  var request = new XMLHttpRequest();
  request.open('POST', corsAnywhere + "https://getpocket.com/v3/oauth/request", true);

  request.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  request.setRequestHeader('X-Accept', 'application/json');
  var requestContent = { 
    consumer_key: consumerKey,
    redirect_uri: window.location.href
  };
  request.send(JSON.stringify(requestContent));

  request.onreadystatechange = function() {
    if(request.readyState == 4 && request.status == 200) {
      var requestToken = JSON.parse(request.responseText);
      var requestCode = requestToken.code;
      sessionStorage.setItem("code", requestCode);
      window.location = "https://getpocket.com/auth/authorize?request_token=" + requestCode + 
        "&redirect_uri=" + requestContent.redirect_uri;
    }
  }
}

function requestAccessToken(consumerKey) {
  var request = new XMLHttpRequest();
  request.open('POST', corsAnywhere + "https://getpocket.com/v3/oauth/authorize", true);

  request.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  request.setRequestHeader('X-Accept', 'application/json');
  var requestCode = sessionStorage.getItem("code");
  var requestContent = { 
    consumer_key: consumerKey,
    code: requestCode
  };
  request.send(JSON.stringify(requestContent));

  request.onreadystatechange = function() {
    if(request.readyState == 4 && request.status == 200) {
      var responseText = JSON.parse(request.responseText);
      sessionStorage.setItem("access_token", responseText.access_token);
      window.location.reload(true);
    }
  }    
}

function getReadItems(consumerKey) {
  var request = new XMLHttpRequest();
  request.open('POST', corsAnywhere + "https://getpocket.com/v3/get", true);

  request.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  request.setRequestHeader('X-Accept', 'application/json');
  var accessToken = sessionStorage.getItem("access_token");
  var requestContent = { 
    consumer_key: consumerKey,
    access_token: accessToken,
    state: "archive",
    sort: "newest",
    detailType: "simple"
  };
  request.send(JSON.stringify(requestContent));

  request.onreadystatechange = function() {
    if(request.readyState == 4 && request.status == 200) {
          var responseText = JSON.parse(request.responseText);

          var list = responseText.list;
          var readList = document.createElement('ul');
          for(var key in list) {
            var listItem = list[key];
            var item = document.createElement("li");
            item.appendChild(document.createTextNode(listItem.given_url));
            readList.appendChild(item);
          }

          document.getElementById("readItems").appendChild(readList);
      }
  }
}