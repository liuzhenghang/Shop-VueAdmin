function getOrderTable() {
    let height=$("#home").height()*0.9;
    layui.use('table', function(){
        let table = layui.table;
        //第一个实例
        let tableIns=table.render({
            elem: '#orderTable'
            ,id:'orderTable'
            ,height: height
            ,url: HOST+"/admin/order/page" //数据接口
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
            // ,toolbar:'default'
            ,headers:{token:app.token,id:app.userId,author:"admin"}
            ,cols: [[ //表头
                {field: 'chk',title: '多选',type:'checkbox',fixed: 'left'}
                ,{field: 'id', title: 'ID', sort: true, width:80}
                ,{field: 'price', title: '消费', sort: true,templet:"<div>{{d.price}}元</div>",width:120}
                ,{field: 'sta', title: '状态', sort: true,width:120,templet:function (d) {
                        if (d.sta){
                            return "<span class='layui-badge layui-bg-green'>正常</span>";
                        }
                        return "<span class='layui-badge layui-bg-gray'>已取消</span>";
                    }}
                ,{fixed: 'right', title:'操作', toolbar: '#orderRightTool'}
            ]]
            ,text:{
                none:"暂无"
            }
        });
        //监听行工具事件
        table.on('tool(orderTable)', function(obj){
            let data = obj.data;
            //console.log(obj)
            if(obj.event === 'close'){
                layer.confirm("是否关闭订单,ID:"+obj.data.id, function(index){
                    // obj.del();
                    post("/admin/order/remove",{token:app.token,id:app.userId,author:"admin"},{id:obj.data.id},function (data) {
                        if (data.code===0){
                            LMessageSuccess("取消成功");
                            tableIns.reload("orderTable");
                            layer.close(index);
                        }else {
                            LMessageError(data.msg,data.code);
                        }
                    },"正在提交")
                });
            }else if (obj.event === "del"){
                layer.confirm("是否删除订单,ID:"+obj.data.id, function(index){
                    // obj.del();
                    post("/admin/order/del",{token:app.token,id:app.userId,author:"admin"},{id:obj.data.id},function (data) {
                        if (data.code===0){
                            LMessageSuccess("删除成功");
                            obj.del();
                            layer.close(index);
                        }else {
                            LMessageError(data.msg,data.code);
                        }
                    },"正在提交")
                });
            }else if(obj.event === 'edit'){
                debug_(obj)
                layer.prompt({title: '修改地址', formType: 2}, function(text, index){
                    post("/admin/order/updateAddress",
                        {token:app.token,id:app.userId,author:"admin"},
                        {id:data.id,address:text},function (data) {
                            if (data.code===0){
                                LMessageSuccess("修改成功");
                                layer.close(index);
                            }else {
                                LMessageError(data.msg,data.code);
                            }
                        },"提交中")
                });
            }else if(obj.event==='cat'){
                let str="";
                post("/admin/order/get",{token:app.token,id:app.userId,author:"admin"},
                    {id:data.id},function (data) {
                    console.log(data)
                        if (data.code===0){
                            let order=data.data.order;
                            let sta="已取消"
                            if (order.sta){
                                sta="正常";
                            }
                            let goods=JSON.parse(order.goods);
                            str+="<p>创建时间:"+order.time+"</p>"
                            str+="<p>创建用户:"+data.data.customer+"</p>"
                            str+="<p>订单金额:￥"+order.price+"</p>"
                            str+="<p>订单状态:￥"+sta+"</p>"
                            str+="<hr class=\"layui-bg-black\">"
                            str+="<h3 style='text-align: center'>商品快照</h3>"
                            str+="<hr class=\"layui-bg-black\">"
                            str+="<div>";
                            for (let i = 0; i < goods.length; i++) {
                                str+="<p>名称:"+goods[i].name+"</p>"
                                str+="<p>单价:￥"+goods[i].price+"</p>"
                                str+="<p>数量:"+goods[i].num+"</p>"
                                str+="<p>总价:￥"+goods[i].num*goods[i].price+"</p>"
                                str+="<hr class=\"layui-bg-black\">"
                            }
                            str+="</div>"
                            layer.open({
                                type: 1,
                                title:"订单快照",
                                closeBtn: 0, //不显示关闭按钮
                                anim: 2,
                                area: ['50%', '90%'],
                                shadeClose: true, //开启遮罩关闭
                                content: "<div style='padding: 10px;'>"+str+"</div>"
                            });
                        }
                    },"正在获取")
            }
        });

    });
}
