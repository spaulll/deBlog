import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import NotificationCard from "../components/notification-card.component";
import LoadMoreDataBtn from "../components/load-more.component";

const Notifications = () => {
    let {userAuth:{access_token}} = useContext(UserContext)
    let [notifications, setNotifications] = useState(null)
    const [filter, setFilter] = useState('all');
    let filters = ['all', 'like', 'comment', 'reply'];

    const fetchNotifications = ({page, deletedDocCount=0}) => {
        axios.post(import.meta.env.VITE_SERVER_URL + "/notification",{ page, filter, deletedDocCount},{
            headers:{
                'Authorization':`Bearer ${access_token}`
            }
        })
        .then(async({data:{ notification:data}}) => {

            let formatedData = await filterPaginationData({
                state: notifications,
                data, page,
                countRoute: "/all-notification-count",
                data_to_send:{filter},
                user: access_token
            })

            setNotifications(formatedData)
        })

        .catch ( err => {
            console.log(err);
        })
    }

    const handleFilter = (e) => {
        setFilter(e.target.innerHTML);
        setNotifications(null)
    };

    useEffect (() => {
        if(access_token){
            fetchNotifications({page: 1})
        }
    },[access_token, filter])

    return (
        <div className="">
            <div className="max-md:hidden">Recent Notification</div>
            <div className="my-8 flex gap-6">
                {
                    filters.map((filterName, i) => (
                        <button 
                            className={"py-2 " + ((filter === filterName) ? "btn-dark" : "btn-light")} 
                            key={i} 
                            onClick={handleFilter}
                        >
                            {filterName}
                        </button>
                    ))
                }
            </div>
            {
                notifications == null ? <Loader/>: 
                <>
                    {
                        notifications.results.length ? 
                        notifications.results.map ((notification,i) => {
                            return (<AnimationWrapper key={i} transition={{delay: i*0.08}}>
                                <NotificationCard data={notification} index={i} notificationState={{notifications, setNotifications}}/>
                            </AnimationWrapper>)
                        })
                        :
                        <NoDataMessage message={`No ${filter === 'all' ? 'notification' : filter === 'like' ? 'like found' : 'comment'}`} />


                    }
                    <LoadMoreDataBtn state={notifications} fetchDataFun={fetchNotifications} additionalparam={{deletedDocCount: notifications.deletedDocCount}} />
                
                </>
            }
        </div>
    );
};

export default Notifications;
