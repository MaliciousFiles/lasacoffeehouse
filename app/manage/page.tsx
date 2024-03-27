"use client";

import React from "react";
import Onboarding, {Flow} from "@/app/onboarding/Onboarding";
import ManagePage from "@/app/manage/ManagePage";

export default function ManagePerformers() {
    return (
        <Onboarding flow={Flow.MANAGE}>
            <ManagePage />
        </Onboarding>
    )
}