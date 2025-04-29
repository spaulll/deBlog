import { Link } from "react-router-dom";

const UserCard = ({ user }) => {
  let {
    personal_info: { user_address, username, profile_img },
  } = user;
  user_address = user_address.substring(0, 6) + "..." + user_address.substring(38, 42);
  return (
    <Link to={`/user/${username}`} className="flex gap-5 items-center mb-5">
      <img src={profile_img} className="rounded-full w-12 h-12"></img>
      <div className="">
        <h1 className="font-medium text-xl line-clamp-2">{user_address}</h1>
        <p className="text-light-grey">@{username}</p>
      </div>
    </Link>
  );
};
export default UserCard;
