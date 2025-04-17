import { useContext } from 'react';
import BatchDetailContext from '../context/batchDetailProvider';

const useBatchDetail = () => {
    return useContext(BatchDetailContext);
};

export default useBatchDetail;
