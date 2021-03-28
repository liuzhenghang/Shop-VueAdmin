function getUser(){
    let height=$("#home").height()*0.9;
    layui.use('table', function(){
        let table = layui.table;
        //第一个实例
        table.render({
            elem: '#adminUserTable'
            ,height: height
            ,url: HOST+"/admin/user/all" //数据接口
            ,parseData:function (res) {
                debug_(res)
                if (res.code===0){
                    return {
                        code:res.code,
                        msg:res.msg,
                        count:res.data.count,
                        data:res.data.data
                    }
                }else {
                    return {
                        code:res.code,
                        msg:res.msg,
                        count:0,
                        data:null
                    }
                }
                }
            ,page: true //开启分页
            ,loading: true
            ,headers:{token:app.token,id:app.userId,author:"admin"}
            ,cols: [[ //表头
                {field: 'id', title: 'ID', sort: true, fixed: 'left',width:80}
                ,{field: 'username', title: '用户名', sort: true}
                ,{field: 'power', title: '级别', sort: true,width:160,templet:function (data) {
                        switch (data.power) {
                            case 0:
                                return "<span class='layui-badge layui-bg-green'>超级管理员</span>";
                            case 1:
                                return "<span class='layui-badge layui-bg-blue'>商品管理员</span>";
                            case 2:
                                return "<span class='layui-badge layui-bg-orange'>订单管理员</span>";
                            default:
                                return "<span class='layui-badge layui-bg-gray'>未知</span>";
                        }
                    }}
                ,{field: 'enable', title: '状态', sort: true,width:80,templet:function (d) {
                        if (d.enable){
                            return "<span class='layui-badge layui-bg-green'>启用</span>";
                        }
                        return "<span class='layui-badge'>禁用</span>";
                    }}
                ,{field: 'ip', title: '登录ip'}
                ,{field: 'time', title: '登录时间', sort: true}
            ]]
            ,text:{
                none:"暂无"
            }
        });

    });
}
