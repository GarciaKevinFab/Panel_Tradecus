import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import './confirmAlert.css'

const ConfirmAlert = ({ title, message, onConfirm }) => {
    confirmAlert({
        title,
        message,
        buttons: [
            {
                label: 'Sí',
                onClick: onConfirm
            },
            {
                label: 'No',
                onClick: () => {}
            }
        ]
    });
};

export default ConfirmAlert;
