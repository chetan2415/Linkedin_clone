import styles from './download.module.css';
import { useDispatch } from 'react-redux';
import { downloadProfile } from '../../config/redux/action/authAction';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from '@fortawesome/free-solid-svg-icons';

function Download({ userId }) {
    const dispatch = useDispatch();

    const handleDownload = () => {
        if (userId) {
            dispatch(downloadProfile(userId));
        } else {
            console.warn("No userId provided for download.");
        }
    };

    return (
        <div className={styles.downloadContainer}>
            <div title="Download" onClick={handleDownload} className={styles.download}>
                <FontAwesomeIcon icon={faDownload} />
            </div>
        </div>
    );
}

export default Download;
