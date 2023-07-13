addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(req) {
  let endpoint = "https://open.iciba.com/dsapi";

  const method = req.method;
  console.log("request method=" + method);
  if (method === 'GET' || method === 'HEAD') {
    return getIndexHtml();
  }

  let date = await req.text();
  if (!date || date === "") {
    date = "2022-04-08";
  }
  console.log("date=" + date);

  endpoint += `/?date=${date}`
  const init = {
    headers: Headers({
      "User-Agent": req.headers.get("User-Agent"),
    }),
  }
  console.log("fetch '" + endpoint + "'");

  try {
    const rsp = await fetch(endpoint, init)
    let rspData = [];
    if (rsp.ok) {
      const data = await rsp.text();
      console.log("data: " + data);

      const content = JSON.parse(data);
      // const content = await rsp.json();

      let image = content["fenxiang_img"];
      rspData.push(`<img src="${image}" width="50%" height="50%" />`);
    } else {
      console.log("fetch " + endpoint + " fail, " + rsp.statusText);
      rspData.push(`<p> fetch result: ${rsp.status} ${rsp.statusText}.</p>`);
    }

    return Response(rspData.join(''), {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    })
  } catch (e) {
    console.log("Got Exception: " + e.stack);
    return Response("Got Exception: " + e.message, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  }
}

async function getIndexHtml() {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>词霸每日一句</title>
  <link href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.6.1/css/bootstrap.min.css" rel="stylesheet">
</head>

<body>
  <div class="container" style="padding: 100px 100px 10px;">
    <form class="bs-example bs-example-form" role="form">
      <div class="row">
        <div class="col-lg-8">
          <div class="input-group">
            <input id="date" type="date" value="2022-04-08" min="2022-01-01" max="2023-01-01">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span class="input-group-btn">
              <button class="btn btn-primary" type="button" onclick="queryDate()">每日一句</button>
            </span>
          </div>
        </div>
      </div>
    </form>
  </div>

  <div id="result_div" class="container" style="padding: 100px 100px 10px; visibility: hidden">
  </div>
</body>
</html>

<script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.js"></script>
<script>
  window.onload = function() {
    let now = new Date();
    let maxDate = now.toISOString().substring(0,10);
    console.log("now=" + maxDate);
    $("#date").attr("value", maxDate);
    $("#date").attr("max", maxDate);
    queryDate();
  };

  async function queryDate() {
    let date = $("#date").val();
    console.log("date = " + date);
    let requestInstance = new Request(window.location.pathname, {
      method: 'post',
      headers: {
        'Content-Type': 'application/text;charset=utf-8'
      },
      body: date,
    })

    let response = await fetch(requestInstance)
    let data = await response.text();
    console.log(data)

    $("#result_div").html(data);
    $("#result_div").css("visibility", "visible");
  }
</script>
  `;

  return Response(html, {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  });
}
