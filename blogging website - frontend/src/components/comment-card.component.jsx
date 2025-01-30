import { getDay } from "../common/date";

const CommentCard = ({index, leftVal, commentData})=>{
    let{comment,commented_by:{ personal_info: {profile_img,fullname,username}},commentedAt} = commentData;
    return ( 
        <>
        <div className="w-full "  style={{paddinfLeft:`${leftVal *10 } px`}}>

            <div className="my-5 p-6 rounded-md border-grey">

                <div className="flex gap-3 items-center mb-8">
                    <img src={profile_img} className="w-12 h-12 rouded-full"/>
                    <p className="line-clamp-1">{fullname} @ {username}</p>
                    <p className="min-w-fit">{getDay(commentedAt)}</p>
                </div>

                <p className="font-gelasio text-xl ml-10">{comment}</p>
            </div>
        </div>
        
        </>
    )
}
export default CommentCard;