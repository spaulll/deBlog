import { Link } from "react-router-dom";
import { Youtube, Instagram, Github, Facebook, Twitter } from "lucide-react";
import { getFullDay } from "../common/date";

const AboutUser = ({ bio, social_links, joinedAt, className }) => {
  // Map social media keys to their respective icons
  const socialIcons = {
    youtube: <Youtube className=" text-2xl hover:text-[#7d2929] " />,
    instagram: <Instagram className=" text-2xl hover:text-[#83473d] "/>,
    github: <Github className=" text-2xl hover:text-[#292a77] "/>,
    facebook: <Facebook className=" text-2xl hover:text-[#4161b1] "/>,
    twitter: <Twitter className=" text-2xl hover:text-[#4c859a] "/>,
  };

  return (
    <div className={"md:w-[90%] md:mt-7 " + className}>
      <p className="text-xl leading-7">
        {bio.length ? bio : "Nothing to read"}
      </p>

      <div className="flex gap-x-7 gap-y-2 flex-wrap my-7 items-center text-black">
        {Object.keys(social_links).map((key) => {
          const link = social_links[key];
          // Render the icon only if the link exists
          return link ? (
            <Link to={link} key={key} target="_blank" rel="noopener noreferrer">
              {socialIcons[key.toLowerCase()] || null}
            </Link>
          ) : null;
        })}
      </div>
      <p className="text-xl leading-7 text-dark-grey">Joined us {getFullDay(joinedAt)}</p>
    </div>
  );
};

export default AboutUser;
