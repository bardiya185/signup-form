<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\AvatarRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\OtpSendRequest;
use App\Http\Requests\OtpVerifyRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Services\AuthService;
use App\Support\ApiResponder;
use App\Support\Dto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController
{
    public function register(RegisterRequest $request): JsonResponse
    {
        return ApiResponder::ok(AuthService::register($request->validated()));
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $input = $request->validated();
        return ApiResponder::ok(AuthService::login($input['identity'], $input['password']));
    }

    public function sendOtp(OtpSendRequest $request): JsonResponse
    {
        return ApiResponder::ok(AuthService::sendOtp($request->validated()['phone']));
    }

    public function verifyOtp(OtpVerifyRequest $request): JsonResponse
    {
        $input = $request->validated();
        return ApiResponder::ok(AuthService::verifyOtp($input['phone'], $input['code']));
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        return ApiResponder::ok(AuthService::forgotPassword($request->validated()['identity']));
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $input = $request->validated();
        AuthService::resetPassword($input['identity'], $input['code'], $input['password']);
        return ApiResponder::ok(['reset' => true]);
    }

    public function me(Request $request): JsonResponse
    {
        return ApiResponder::ok(Dto::userDto($request->attributes->get('gnk_user')));
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        $patch = array_filter($request->validated(), fn ($v) => $v !== null);
        return ApiResponder::ok(AuthService::updateProfile($user, $patch));
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $input = $request->validated();
        AuthService::changePassword($request->attributes->get('gnk_user'), $input['current_password'], $input['new_password']);
        return ApiResponder::ok(['changed' => true]);
    }

    public function avatar(AvatarRequest $request): JsonResponse
    {
        return ApiResponder::ok(AuthService::setAvatar($request->attributes->get('gnk_user'), $request->validated()['avatar']));
    }

    public function logout(Request $request): JsonResponse
    {
        AuthService::logout($request->bearerToken());
        return ApiResponder::ok(['loggedOut' => true]);
    }
}
