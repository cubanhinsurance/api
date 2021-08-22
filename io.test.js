function load(){
    var sc = document.createElement('script');
      sc.setAttribute(
        'src',
        'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.4.0/socket.io.js',
      );
      document.head.appendChild(sc);
  }
  
  function conn(namespace,token) {
    const c = io(`http://localhost:4000/${namespace}`,{query:{Authorization:token}});
    var events = {};
    c.onevent=function(){
      console.log(arguments)
    }
    return c;
  }