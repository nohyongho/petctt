
const messages = {
    "eng": {
        session: { expire: 'Your session has been expired please login again.' },
        newUser: {
            success: 'Account has been created successfully, Please verify your email.',
            error: 'Unable to create account, internal server error.',
            alreadyExist: 'You are already registered with Coupon TalkTalk.'
        },
        user: {
            error: 'Somthing is wrong.\nPlease try again later or contact with service provider.',
            wrongOldPassword: 'You enter wrong old password. \n Please insert correct old password.',
            changePassSuccess: 'password changed successfuly.',
            forgotEmail: 'Verification code sent to your registered email.',
            notRegistered: 'You are not register with coupon talktalk.\n Please register first or check your provided email.'
        },
        login: {
            success: 'Logged In successfully',
            user_not_found: 'User is not registered',
            email_not_verified: 'Your email is not verified',
            error: 'Unable to login, internal server error',
            invalid_credentials: 'Provided credentials are incorrect, please try again',
            user_blocked: 'User is blocked by admin.',
            refreshedToken: 'Token is succefully refreshed!',
            logout: 'successfully logout',
            logoutError: 'logout failed ',
            unauthorized: 'unauthorized user',
            tokenExpire: 'The authentication token has expired.',
            invalidToken: 'Invalid authorization token.'
        },
        verify_email: {
            success: 'Your email has been verified, now you can use your app.',
            link_expired: 'Your verification has been expired. Try by sending new verification link.',
            error: 'Unable to verify email, internal server error.',
            alreadyVerified: 'You are already verified your Coupon Talk Talk account.\n Now You can login to the app.\n Thank You !',
            verificationRecordNotfound: 'Internal server error.\nPlease try again or contact with our suport team.',
            wrongCode: 'Verification code is wrong',
            codeExpire: 'Verification code is Expire please send new code.'
        },
        reset_password: {
            success: 'Your password has been updated successfully',
            error: 'Unable to update password, internal server error'
        },
        update_profile: {
            success: 'Your profile has been updated successfully',
            profileImage: 'profile image changed',
            user_not_found: 'User is not registered',
            error: 'Unable to update your profile, internal server error'
        },
        get_coupons: {
            success: 'ok',
            coupon_not_found: 'Coupons are not available, try again later',
            error: 'Unable to fetch coupons, internal server error'
        },
        collect_coupon: {
            success: 'Coupon collected successfully.',
            already_collected: 'Sorry the coupon collect limit is over.',
            coupon_not_found: 'Coupons are not available, try again later',
            invalid_data: 'Invalid data.',
            error: 'Unable to collect coupon, internal server error'
        },
        collected_coupon_history: {
            success: 'Ok',
            error: 'Unable to fetch history, internal server error'
        },
        common: {
            success: 'Ok',
            emptyRecord: 'No Record Found'
        },
        records: {
            alreadyExt: 'Record already exist.',
            notFound: 'Record not found.',
            newRecord: 'New record has been created successfully.',
            updateRecord: 'Record has been updated successfully.',
            deleteRecord: 'Record has been deleted successfully.'
        },
        redeem: {
            success: 'Please show the QR on outlet and take your order.\nThank you!',
            redeemed: 'Coupon Successfully Verified.\nPlease serve the order.\nThank you!',
            error: 'There was a problem.\nPlease try again or contact your service provider.',
            wrongCode: 'Coupon code is invalid Please enter a valid code',
            wrongStore: 'Coupon is not valid on this Store. Please visit the valid store.',
            notFound: 'This coupon is already redeemed or it does not belong to this store.'
        }
    },
    "kor": {
        session: { expire: '세션이 만료되었습니다 다시 로그인하십시오.' },
        newUser: {
            success: '계정이 성공적으로 생성되었습니다. 이메일을 확인하십시오.',
            error: '내부 서버 오류 계정을 만들 수 없습니다. \n 다시 시도하십시오',
            alreadyExist: '쿠폰 토크 토크에 이미 등록되어 있습니다.'
        },
        user: {
            error: '문제가 있습니다. \n 나중에 다시 시도하거나 서비스 제공 업체에 문의하십시오.',
            wrongOldPassword: '잘못된 이전 비밀번호를 입력했습니다. \n 올바른 이전 비밀번호를 입력하십시오.',
            changePassSuccess: '비밀번호가 변경되었습니다.',
            forgotEmail: '등록 코드로 확인 코드를 보냈습니다.',
            notRegistered: '쿠폰 토크 토크에 등록하지 않았습니다. \n 먼저 등록하거나 제공된 이메일을 확인하십시오.'
        },
        login: {
            success: '성공적으로 로그인',
            user_not_found: '사용자가 등록되지 않았습니다',
            email_not_verified: '귀하의 이메일이 확인되지 않았습니다',
            error: '로그인 할 수 없습니다. 내부 서버 오류',
            invalid_credentials: '제공된 자격 증명이 잘못되었습니다. 다시 시도하십시오',
            user_blocked: '사용자가 관리자에 의해 차단되었습니다.',
            refreshedToken: '토큰이 성공적으로 갱신되었습니다!',
            logout: '성공적으로 로그 아웃',
            logoutError: '로그 아웃 실패',
            unauthorized: '무단 사용자',
            tokenExpire: '인증 토큰이 만료되었습니다.',
            invalidToken: '유효하지 않은 인증 토큰.'
        },
        verify_email: {
            success: '이메일이 확인되었으므로 이제 앱을 사용할 수 있습니다.',
            link_expired: '확인이 만료되었습니다. 새로운 확인 링크를 보내보십시오.',
            error: '이메일, 내부 서버 오류를 확인할 수 없습니다.',
            verificationRecordNotfound: '내부 서버 오류입니다. \n 다시 시도하거나 지원팀에 문의하십시오.',
            wrongCode: ' 인증 코드가 잘못되었습니다',
            codeExpire: '인증 코드가 만료되었습니다. 새 코드를 보내십시오.'
        },
        reset_password: {
            success: '비밀번호가 성공적으로 업데이트되었습니다',
            error: '비밀번호를 업데이트 할 수 없습니다. 내부 서버 오류'
        },
        update_profile: {
            success: '당신의 프로필은 성공적으로 업데이트되었습니다',
            profileImage: '프로필 이미지가 변경되었습니다.',
            user_not_found: '사용자가 등록되지 않았습니다',
            error: '내부 서버 오류로 프로필을 업데이트 할 수 없습니다'
        },
        get_coupons: {
            success: '승인',
            coupon_not_found: '쿠폰을 사용할 수 없습니다. 나중에 다시 시도하십시오',
            error: '쿠폰을 가져올 수 없습니다. 내부 서버 오류'
        },
        collect_coupon: {
            success: '쿠폰이 성공적으로 수집되었습니다.',
            already_collected: '쿠폰 수령 한도를 초과했습니다.',
            coupon_not_found: '쿠폰을 사용할 수 없습니다. 나중에 다시 시도하십시오',
            invalid_data: '유효하지 않은 데이터.',
            error: '쿠폰을 수집 할 수 없습니다. 내부 서버 오류'
        },
        collected_coupon_history: {
            success: '승인',
            error: '히스토리를 가져올 수 없습니다. 내부 서버 오류'
        },
        common: {
            success: '승인',
            emptyRecord: '기록을 찾을 수 없습니다'
        },
        records: {
            alreadyExt: '레코드가 이미 존재합니다.',
            notFound: '레코드를 찾을 수 없습니다.',
            newRecord: '새 레코드가 작성되었습니다.',
            updateRecord: '레코드가 성공적으로 업데이트되었습니다.',
            deleteRecord: '레코드가 성공적으로 삭제되었습니다.'
        },
        redeem: {
            success: '콘센트에 QR을 보여 주시고 주문하십시오. \ n 감사합니다!',
            error: '문제가 발생했습니다. \ n 다시 시도하거나 서비스 제공 업체에 문의하십시오.',
            wrongCode: '쿠폰 코드가 잘못되었습니다. 유효한 코드를 입력하십시오',
            notFound: '기록을 찾을 수 없습니다'
        }
    }
}

module.exports = {
    getter: (req, method, messageType) => {
        let lang = 'eng'
        if (req) {
            const checkLang = req.acceptsLanguages('eng', 'kor');
            if (checkLang) {
                lang = checkLang;
            }
        }
        return messages[lang][method][messageType];
    }
};