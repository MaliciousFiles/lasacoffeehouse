import {Oval} from "react-loader-spinner";

export default function Loading(props: {enabled: boolean}) {
    const {enabled} = props;

    return (
        <div className={"w-full h-full z-50 fixed flex bg-black bg-opacity-60 transition-all duration-500"+(!enabled ? " opacity-0 invisible" : "")}>
            <Oval wrapperClass={"m-auto"}
                  color={"#defffe"} secondaryColor={"#defffe"}
                  width={"7.5rem"} height={"7.5rem"}
                  strokeWidth={3.5} strokeWidthSecondary={3.5}
            />
        </div>
    )
}