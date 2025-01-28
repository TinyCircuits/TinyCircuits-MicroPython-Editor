import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { Toast, Alert } from "react-daisyui";


const Alerts = forwardRef(function Alerts(props, ref){

    const [alerts, setAlerts] = useState([]);
    let removeTimeout = useRef(null);

    const renderAlerts = () => {
        if(alerts.length == 0){
            return;
        }

        let result = alerts.map((alert, index) => {
            return(
                <Alert key={index} status="success">{alert}</Alert>
            );
        });

        return result;
    }

    // Every two seconds, remove the oldest alert
    const removeAlert = () => {
        setAlerts([]);
        removeTimeout.current = null;
    }

    useImperativeHandle(ref, () => ({
        // Add an alert
        add(alert){
            setAlerts([...alerts, alert]);
        },
    }));

    useEffect(() => {
        // Restart tiemout
        if(removeTimeout.current != null){
            clearTimeout(removeTimeout.current);
        }

        // Start the alert remover
        removeTimeout.current = setTimeout(removeAlert, 4000);
    }, [alerts])

    return(
        <Toast ref={ref} vertical="bottom" horizontal="start" className="my-8 z-[1000]">
            {renderAlerts()}
        </Toast>
    );
});


export default Alerts;