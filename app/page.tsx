"use client";

import React from "react";
import Onboarding, {Flow} from "@/app/onboarding/Onboarding";
import MainPage from "@/app/MainPage";

export default function ViewPerformers() {
    return (
        <Onboarding flow={Flow.MAIN}>
            <MainPage />
        </Onboarding>
    )
}