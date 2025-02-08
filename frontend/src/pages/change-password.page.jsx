import { KeyRound } from "lucide-react";
import AnimationWrapper from "../common/page-animation"
import InputBox from "../components/input.component";
import {toast, Toaster} from "react-hot-toast"
import { useContext, useRef } from "react";
import axios from "axios"
import {UserContext} from "../App"
const ChangePassword = () =>{
    let {userAuth:{access_token}} = useContext(UserContext);
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    let changePasswordForm = useRef()
    const handelSubmit = (e) =>{
        e.preventDefault();
        let form = new FormData(changePasswordForm.current);
        let formData = { };
        for (let[key, value] of form.entries()){
            formData[key] = value;
        }

        let{currentPassword, newPassword} = formData;
        if(!currentPassword.length || !newPassword.length){
            return toast.error("input before submiting");
        }
        if(!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)){
            return toast.error("Password must be 6-20 characters long, include at least one uppercase letter, one lowercase letter, and one digit.");

        }

        e.target.setAttribute("disable", true)

        let loadingToast = toast.loading("updating....");
        axios.post(import.meta.env.VITE_SERVER_URL + "/change-password", formData, {
            headers: {
                'Authorization': `bearer ${access_token}`
            }
        })
        .then(() =>{
            toast.dismiss(loadingToast)
            e.target.removeAttribute("disable")
            return toast.success("password changed")
        })
        .catch (({response}) => {
            toast.dismiss(loadingToast)
            e.target.removeAttribute("disable")
            return toast.error(response.data.error)
        })

    }
    return(
        <>
        
        <AnimationWrapper>
        <Toaster />

            <form ref={changePasswordForm} >
                <h1 className="max-md:hidden">Change password</h1>
                <div className="py-10 w-full md:max-w-[400px]">
                    <InputBox name="currentPassword" type="password" className="profile-edit-input" placeholder="current Password" icon={<KeyRound size={20} className="absolute left-2 top-4" />}/>
                    
                    <InputBox name="newPassword" type="password" className="profile-edit-input" placeholder="New Password" icon={<KeyRound size={20} className="absolute left-2 top-4" />}/>

                    <button className="btn-dark px-10" onClick={handelSubmit}>password</button>
                    
                </div>
            </form>

        </AnimationWrapper>
        </>
    )
}

export default ChangePassword;