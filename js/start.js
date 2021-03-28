function start() {
    LMessageLoading("正在准备资源");
    $(".home").slideUp(0);
    startVue();
    catToken();
    $(".home").eq(0).slideDown(0);
    $(".home").eq(0).addClass("layui-anim layui-anim-upbit");

    $(".left-button").click(function (){
        $(".home").slideUp(0);
        let index=$(".left-button").index(this);
        $(".home").eq(index).slideDown(0);
        $(".home").eq(index).addClass("layui-anim layui-anim-upbit");
    });
}
function loginOk() {
    //登录就绪，加载视窗
    getUser();
    getGoodsTable();
    getOrderTable();
}
function catToken() {
    setTimeout(function () {
        let token=localStorage.getItem('token');
        let userId=localStorage.getItem('id');
        let username=localStorage.getItem('user');
        if (token ==="null" || userId==="null" ||username ==="null" || token ===null || userId===null ||username ===null){
            localStorage.removeItem('token');
            localStorage.removeItem('id');
            localStorage.removeItem('user');
            location.href = 'login.html';
        }
        post("/admin/user/token",{token:token,id:userId,author:"admin"},null,function (data) {
            if (data.code===0){
                if (data.data>60){
                    app.tokenTime=data.data;
                    setInterval(function () {
                        app.tokenTime--;
                        if (app.tokenTime<=0){
                            layer.alert('登录过期，请重新登录', {icon: 5,end:function () {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('id');
                                    localStorage.removeItem('user');
                                    location.href = 'login.html';
                                }});
                        }
                    },1000);
                    app.userId=userId;
                    app.username=username;
                    app.token=token;
                    loginOk();
                }else if (data.data<=60 && data.data>=0){
                    LMessageError("自动登录失败，用户身份过期，请重新登录");
                    localStorage.setItem('token',null);
                    localStorage.setItem('id',null);
                    localStorage.setItem('user',null);
                    location.href = 'login.html';
                }
            }
        },"正在准备资源");
    },1000);
}
function loginOut() {
    localStorage.setItem('token',null);
    localStorage.setItem('id',null);
    localStorage.setItem('user',null);
    location.href = 'login.html';
}
function startVue() {
    app=new Vue({
        el:"#VUEBox",
        data:{
            userId:0,username:"",token:"",tokenTime:0,
            userList:[],userListPage:0,userListPageAll:0,
        }
    })
}