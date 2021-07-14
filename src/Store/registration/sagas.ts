import { takeEvery, call, select, put } from 'redux-saga/effects';
import { postRequest } from 'src/helpers/requests';
import { routes } from 'src/constants/routes';
//@ts-ignore
import { NotificationManager } from 'react-notifications';
import i18next from 'i18next';
import { validation } from 'src/helpers/validation';
import { actionTypes } from './actionTypes';
import { regValues } from './selectors';
import { setRegistrationValue, clearRegistrationInputs, reciveErrorRequest, reciveSuccessRequest } from './actions';
import { TRegValues } from './types/allTypes';
import { } from '../../helpers/types/requestTypes';

export function* workerRegistration() {
    try {
        const data: TRegValues = yield select(regValues);
        const { message: validateMessage, isValid } = yield call(
            [validation, validation.registrationValidation], data);
        if (!isValid) {
            //@ts-ignore
            return yield call([NotificationManager, NotificationManager.error], i18next.t(validateMessage), i18next.t('input_error'), 2000);
        }
        const answer = yield call(postRequest, routes.account.registration, { ...data, confirm: undefined });
        if (answer.status < 205) {
            yield (put(clearRegistrationInputs()));
            yield put(setRegistrationValue({ name: 'success', value: true }));
            yield put(reciveSuccessRequest());
        } else {
            yield put(setRegistrationValue({ name: 'success', value: false }));
            yield put(reciveErrorRequest());
            yield call([NotificationManager, NotificationManager.error], i18next.t(answer), i18next.t('reg_error'), 2000);
        }
    } catch (e) {
        yield put(setRegistrationValue({ name: 'success', value: false }));
        yield put(reciveErrorRequest());
        yield call([NotificationManager, NotificationManager.error], i18next.t('server_error_text'), i18next.t('server_error'), 2000);
    }
}

export function* watcherRegistration() {
    yield takeEvery(actionTypes.SEND_REGISTRATION_REQUEST, workerRegistration);
}
