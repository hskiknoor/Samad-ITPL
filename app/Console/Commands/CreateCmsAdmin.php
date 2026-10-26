<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class CreateCmsAdmin extends Command
{
    protected $signature = 'cms:admin {email?} {--name=Administrator}';

    protected $description = 'Create an administrator, or securely reset an existing administrator password';

    public function handle(): int
    {
        $email = $this->argument('email') ?: $this->ask('Administrator email');
        $password = getenv('CMS_ADMIN_PASSWORD') ?: ($this->input->isInteractive() ? $this->secret('Password (12+ characters including letters and numbers)') : '');
        $data = ['email' => $email, 'password' => $password, 'name' => $this->option('name')];
        $validator = Validator::make($data, ['email' => ['required', 'email', 'max:180'], 'name' => ['required', 'string', 'max:80'], 'password' => ['required', Password::min(12)->letters()->numbers()]]);
        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }
        User::updateOrCreate(['email' => $email], ['name' => $data['name'], 'password' => $password, 'role' => 'admin']);
        $this->info('Administrator account saved.');

        return self::SUCCESS;
    }
}
