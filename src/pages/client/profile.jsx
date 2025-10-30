import React from "react";
import {link} from "react-router-dom"
import ClientLayout from "../../components/Layout/ClientLayout";

function ClientProfile() {
    return(
        <ClientLayout pageTitle="Profile">
            <>
                <h1>This is profile page.</h1>
            </>
        </ClientLayout>
    );
};

export default ClientProfile;