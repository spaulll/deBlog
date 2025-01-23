import { Link } from "react-router-dom";

const UserCard = ({ user }) => {
  let {
    personal_info: { fullname, username, profile_img },
  } = user;
  return (
    <Link to={`/user/${username}`} className="flex gap-5 items-center mb-5">
      <img src={profile_img} className="rounded-full w-12 h-12"></img>
      <div className="">
        <h1 className="font-medium text-xl line-clamp-2">{fullname}</h1>
        <p className="text-light-grey">@{username}</p>
      </div>
    </Link>
  );
};
export default UserCard;
